'use server';

import connect from "@/lib/mongodb";
import Component from "@/models/Components";

export async function addComponent(componentData) {
  try {
    await connect();
    
    // Remove any undefined or empty fields
    const cleanedData = Object.fromEntries(
      Object.entries(componentData).filter(([_, v]) => v !== undefined && v !== '')
    );
    
    // Create the component
    const newComponent = await Component.create(cleanedData);
    
    return { success: true, component: JSON.parse(JSON.stringify(newComponent)) };
  } catch (error) {
    console.error("Error adding component:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteComponent(componentId) {
  try {
    await connect();
    
    await Component.findByIdAndDelete(componentId);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting component:", error);
    return { success: false, error: error.message };
  }
}