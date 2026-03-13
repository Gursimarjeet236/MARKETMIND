
import React from 'react';

const Placeholder = ({ name }) => (
    <section className="py-20 border-b">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">{name} Section</h2>
            <p className="text-muted-foreground">This section is being rebuilt.</p>
        </div>
    </section>
);

export default Placeholder;
