'use client';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">

        {/* Contact Info */}
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-6">Contact Us</h1>
          <p className="text-slate-600 mb-10">
            Have questions about our merchant plans, B2B SaaS workflow, or need technical support?
            Our team in Bengaluru is here to help.
          </p>

          <div className="space-y-6">
            <a href="mailto:contact@nearme-india.org" className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 group">
              <div className="bg-emerald-100 p-4 rounded-xl group-hover:bg-emerald-500 transition-colors">
                <Mail className="w-6 h-6 text-emerald-600 group-hover:text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Email Us</p>
                <p className="text-lg font-black text-slate-900">contact@nearme-india.org</p>
              </div>
            </a>

            <a href="https://wa.me/918247831885" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 group">
              <div className="bg-emerald-100 p-4 rounded-xl group-hover:bg-emerald-500 transition-colors">
                <Phone className="w-6 h-6 text-emerald-600 group-hover:text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">WhatsApp Support</p>
                <p className="text-lg font-black text-slate-900">+91 8247831885</p>
              </div>
            </a>

            <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="bg-indigo-100 p-4 rounded-xl">
                <MapPin className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Operating Address</p>
                <p className="text-lg font-black text-slate-900">Bengaluru, Karnataka, India</p>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-slate-900 p-8 rounded-3xl text-slate-100">
            <h3 className="text-xl font-bold mb-4 text-white">Grievance Officer</h3>
            <p className="text-sm text-slate-400 mb-2">Name: <span className="font-bold text-white">Beerangi Kartheek Kumar</span></p>
            <p className="text-sm text-slate-400 mb-2">Email: <span className="font-bold text-white">contact@nearme-india.org</span></p>
            <p className="text-sm text-slate-400">Resolution Timeline: Within 48 hours</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Send an Inquiry</h2>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully. We will get back to you within 24 hours.'); }}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
              <textarea required rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="How can we help you?"></textarea>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Send className="w-5 h-5" /> Send Message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
