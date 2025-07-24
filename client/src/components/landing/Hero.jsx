// src/components/landing/Hero.jsx
import { Link } from 'react-router-dom'

const Hero = () => {
    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center p-6">
            <div className="max-w-3xl text-center">
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                    A buzzing hub for all your tasks.
                </h1>
                <p className="text-xl mb-8">
                    Organize your life with ease.
                </p>
                <Link
                    to="/login"
                    className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition"
                >
                    Get Started
                </Link>
            </div>
        </section>
    )
}

export default Hero
