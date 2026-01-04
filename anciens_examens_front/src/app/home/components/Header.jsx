import React from 'react';
import logoUIDT from '@/assets/logo_uidt.jpeg';
import { Menu, User } from 'lucide-react';

export default function Header() {


  return (
    <header className='w-full px-8 flex items-center justify-between py-4 bg-white shadow'>
        <a href="/" className='active:scale-90 duration-200'>
            <img
                src={logoUIDT}
                className='h-14'
                alt="UIDT Logo"
            />
        </a>
        <a href="/" className='text-3xl font-bold text-gray-800 hover:text-gray-600 active:scale-95 duration-200'>Anciens Examens</a>
        <button className='active:scale-90 duration-200'>
            <User size={40} className='text-gray-500 text-4xl border rounded-full p-1.5 hover:bg-gray-200 duration-200'/>
        </button>
    </header>
  );
};