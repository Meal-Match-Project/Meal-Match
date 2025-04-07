import { Suspense } from 'react';
import LoggedInNav from '@/app/components/LoggedInNav';
import TemplatesPage from '@/app/components/TemplatesPage';
import connect from '@/lib/mongodb';
import Template from '@/models/Templates';
import User from '@/models/Users';

export default async function Templates({ params }) {
  const userId = await params.userId;
  
  await connect();
  
  // Get user dietary preferences for filtering
  const user = await User.findById(userId).select('dietary_preferences allergies').lean();
  
  // Get all available templates
  const templates = await Template.find({}).lean();
  
  // Convert MongoDB objects to plain objects
  const serializedTemplates = JSON.parse(JSON.stringify(templates));
  
  return (
    <>
      <LoggedInNav userId={userId} />
      <Suspense fallback={<div className="p-12 text-center">Loading templates...</div>}>
        <TemplatesPage 
          userId={userId} 
          templates={serializedTemplates} 
          userPreferences={user?.dietary_preferences || ''} 
          userAllergies={user?.allergies || ''}
        />
      </Suspense>
    </>
  );
}