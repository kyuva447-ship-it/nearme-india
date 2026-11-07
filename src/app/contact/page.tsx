import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-10 text-white text-center">
          <h1 className="text-4xl font-black mb-4 tracking-tight">Contact NearMe India</h1>
          <p className="text-emerald-50 text-lg max-w-2xl mx-auto">
            Need help? We're here to assist you with any questions about our hyper-local directory, B2B services, or merchant dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Contact Info */}
          <div className="p-10 bg-slate-50/50">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Get in Touch</h2>

            <div className="space-y-8">
              <div className="flex items-start gap-4 group">
                <div className="bg-emerald-100 p-3 rounded-2xl group-hover:bg-emerald-200 transition-colors">
                  <Mail className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Email Support</h3>
                  <p className="text-slate-600 mt-1">contact@nearme-india.org</p>
                  <p className="text-xs text-slate-500 mt-1">We aim to reply within 24 hours.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-emerald-100 p-3 rounded-2xl group-hover:bg-emerald-200 transition-colors">
                  <Phone className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Phone</h3>
                  <p className="text-slate-600 mt-1">Phone number protected</p>
                  <p className="text-xs text-slate-500 mt-1">Mon-Fri, 9am - 6pm IST</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-emerald-100 p-3 rounded-2xl group-hover:bg-emerald-200 transition-colors">
                  <MapPin className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Office Location</h3>
                  <p className="text-slate-600 mt-1">Bengaluru, Karnataka, India</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100">
               <h4 className="font-bold text-amber-900 mb-2">Merchant Verification</h4>
               <p className="text-amber-800 text-sm">For document submission or physical verification requests, please email us directly with your Shop ID.</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Send a Message</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="john@nearme-india.org"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <select id="subject" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-600 bg-white">
                    <option>General Inquiry</option>
                    <option>Merchant Onboarding</option>
                    <option>B2B Bulk Order</option>
                    <option>Report an Issue</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
