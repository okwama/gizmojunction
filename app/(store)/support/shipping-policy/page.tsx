export default function ShippingPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8">Shipping Policy</h1>
            <div className="prose prose-neutral max-w-none">
                <p>At Gizmo Junction, we strive to deliver your tech as fast as possible. Here is everything you need to know about our shipping processes.</p>
                <h2 className="text-2xl font-semibold mt-8 mb-4">Shipping Rates & Estimates</h2>
                <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Standard Shipping:</strong> 3-5 business days ($5.99, Free for orders over $50)</li>
                    <li><strong>Express Shipping:</strong> 1-2 business days ($14.99)</li>
                </ul>
                <h2 className="text-2xl font-semibold mt-8 mb-4">Domestic Shipping Policy</h2>
                <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.</p>
            </div>
        </div>
    );
}
