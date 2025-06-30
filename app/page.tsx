'use client';

import React from 'react';
import DiscoveryForm from '../components/DiscoveryForm';
import { FormSubmission } from '../lib/types';

export default function HomePage() {
  
  const handleSubmit = async (submission: FormSubmission) => {
    try {
      console.log('Submission received:', submission);
      
      // Here we would integrate with Supabase
      // For now, just log the submission
      
      // Show success message
      alert('Discovery Notecraft™ enviado com sucesso! Entraremos em contato em breve.');
      
      // Optional: redirect to thank you page
      // window.location.href = '/obrigado';
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erro ao enviar formulário. Tente novamente.');
    }
  };

  return (
    <main className="min-h-screen">
      <DiscoveryForm 
        onSubmit={handleSubmit}
        className="w-full"
      />
    </main>
  );
}