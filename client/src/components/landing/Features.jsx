const features = [
    { title: 'Smart Projects', desc: 'Organize tasks into projects and track progress easily.' },
    { title: 'Tags & Search', desc: 'Use tags to find anything instantly.' },
    { title: 'Subtasks & Deadlines', desc: 'Break tasks down and never miss a deadline.' },
    { title: 'Activity Logs', desc: 'Keep track of everything that happens.' },
]

const Features = () => {
    return (
        <section className="bg-white py-16 px-6">
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-8">Why Choose Our App?</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {features.map((f, idx) => (
                        <div key={idx} className="bg-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition">
                            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                            <p className="text-gray-600">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features
