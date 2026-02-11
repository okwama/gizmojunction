export default function FAQsPage() {
    const categories = [
        {
            name: "Orders & Shipping",
            questions: [
                { q: "How do I track my order?", a: "Once your order has shipped, you will receive a tracking number via email." },
                { q: "Do you ship internationally?", a: "Yes, we ship to over 50 countries worldwide. Shipping rates vary by location." }
            ]
        },
        {
            name: "Products & Returns",
            questions: [
                { q: "What is your return policy?", a: "We offer a 30-day money-back guarantee on all unused items in original packaging." },
                { q: "Do products come with warranty?", a: "All products come with a minimum 1-year manufacturer warranty." }
            ]
        }
    ];

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
            <div className="max-w-3xl mx-auto space-y-12">
                {categories.map((cat) => (
                    <div key={cat.name}>
                        <h2 className="text-2xl font-bold mb-6 text-blue-600">{cat.name}</h2>
                        <div className="space-y-6">
                            {cat.questions.map((q, i) => (
                                <div key={i} className="border-b pb-6 last:border-0">
                                    <h3 className="text-lg font-semibold mb-2">{q.q}</h3>
                                    <p className="text-neutral-600 dark:text-neutral-400">{q.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
