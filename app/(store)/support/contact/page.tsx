export default function ContactUsPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
                    <p className="text-neutral-600 mb-8">Have a question about a product or your order? Our support team is here to help 24/7.</p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-full text-blue-600">📍</span>
                            <span>123 Tech Lane, Silicon Valley, CA</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-full text-blue-600">📞</span>
                            <span>+1 (800) GIZMO-TEC</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-full text-blue-600">✉️</span>
                            <span>support@gizmojunction.com</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-sm border">
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" className="w-full px-4 py-2 border rounded-lg" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Message</label>
                            <textarea className="w-full px-4 py-2 border rounded-lg h-32" placeholder="How can we help?"></textarea>
                        </div>
                        <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
