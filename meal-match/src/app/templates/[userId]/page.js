import { Suspense } from 'react';
import LoggedInNav from '@/components/LoggedInNav';
import TemplatesPage from '@/components/TemplatesPage';
import connect from '@/lib/mongodb';
import Template from '@/models/Templates';
import User from '@/models/Users';

export default async function Templates({ params }) {
  const urlParams = await params;
  const userId = urlParams.userId;
  
  await connect();
  
  // Get user dietary preferences for filtering
  const user = await User.findById(userId).select('dietary_preferences allergies').lean();
  
  // Get all available templates
  const templates = await Template.find({}).lean();
  
  // Convert MongoDB objects to plain objects
  const serializedTemplates = JSON.parse(JSON.stringify(templates));
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <LoggedInNav userId={userId} />
      <Suspense fallback={<div className="p-12 text-center">Loading templates...</div>}>
        <TemplatesPage 
          userId={userId} 
          templates={serializedTemplates} 
        />
      </Suspense>
    </div>
  );
}