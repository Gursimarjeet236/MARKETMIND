import os
import sys
import glob
import tensorflow as tf
import shutil
import tf2onnx.convert

from dgcgru import gcgru
from gcnattn_layers import GCNTemporalAttention, TemporalAttentionBlock

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "models"))

VARIANT_CUSTOM_OBJECTS = {
    "refined_regcn": {"gcgru": gcgru},
    "gcnattn": {
        "GCNTemporalAttention": GCNTemporalAttention,
        "TemporalAttentionBlock": TemporalAttentionBlock,
    },
}

def convert_all():
    temp_saved_model_path = os.path.join(MODELS_DIR, "temp_saved_model")
    
    # Save the original sys.argv
    orig_argv = sys.argv

    for variant in ["refined_regcn", "gcnattn"]:
        variant_dir = os.path.join(MODELS_DIR, variant)
        if not os.path.exists(variant_dir):
            print(f"Directory not found: {variant_dir}")
            continue
        
        onnx_variant_dir = os.path.join(MODELS_DIR, f"{variant}_onnx")
        os.makedirs(onnx_variant_dir, exist_ok=True)
        
        keras_files = glob.glob(os.path.join(variant_dir, "*.keras"))
        print(f"\n--- Converting {len(keras_files)} models for variant: {variant} ---")
        
        custom_objs = VARIANT_CUSTOM_OBJECTS[variant]
        
        for k_file in keras_files:
            filename = os.path.basename(k_file)
            onnx_filename = filename.replace(".keras", ".onnx")
            onnx_path = os.path.join(onnx_variant_dir, onnx_filename)
            
            if os.path.exists(onnx_path):
                print(f"Skipping (already exists): {onnx_filename}")
                continue
                
            print(f"Converting {filename} -> {onnx_filename}...")
            
            # Clean up temp dir if left from a failed run
            if os.path.exists(temp_saved_model_path):
                try:
                    shutil.rmtree(temp_saved_model_path)
                except Exception:
                    pass
                
            try:
                # 1. Load the Keras model
                model = tf.keras.models.load_model(k_file, custom_objects=custom_objs)
                
                # 2. Export to SavedModel
                try:
                    model.export(temp_saved_model_path)
                except AttributeError:
                    try:
                        tf.saved_model.save(model, temp_saved_model_path)
                    except Exception:
                        model.save(temp_saved_model_path, save_format="tf")
                
                # Clear TF session to prevent memory leak
                tf.keras.backend.clear_session()
                del model
                
                # 3. Call tf2onnx in-process by rewriting sys.argv and calling main()
                sys.argv = [
                    "tf2onnx.convert",
                    "--saved-model", temp_saved_model_path,
                    "--output", onnx_path,
                    "--opset", "13"
                ]
                
                try:
                    tf2onnx.convert.main()
                except SystemExit as e:
                    if e.code != 0:
                        print(f"tf2onnx failed for {filename} with exit code: {e.code}")
                    else:
                        print(f"Successfully converted: {onnx_filename}")
                else:
                    print(f"Successfully converted: {onnx_filename}")
                    
            except Exception as e:
                print(f"Failed to convert {filename}: {e}")
            finally:
                if os.path.exists(temp_saved_model_path):
                    try:
                        shutil.rmtree(temp_saved_model_path)
                    except Exception:
                        pass
                # Reset sys.argv back to original
                sys.argv = orig_argv

if __name__ == "__main__":
    convert_all()
    print("\nAll conversions completed!")
