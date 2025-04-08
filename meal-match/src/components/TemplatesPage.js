'use client';

import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TemplateCard from './TemplateCard';
import TemplateDetailModal from './modals/TemplateDetailModal';
import ConfirmationModal from './ui/ConfirmationModal';
import NotificationToast from './ui/NotificationToast';
import useNotification from '@/hooks/useNotification';
import { getTemplates, deleteTemplate, importTemplate } from '@/services/apiService';

// Sub-component for empty templates state
const EmptyTemplatesView = ({ userId }) => (
  <div className="text-center py-12 bg-gray-50 rounded-lg">
    <h3 className="text-xl font-medium text-gray-700 mb-2">No templates found</h3>
    <p className="text-gray-500">
      You don't have any meal plan templates yet.
    </p>
    <p className="mt-4">
      <a 
        href={`/dashboard/grid/${userId}`}
        className="text-orange-500 hover:text-orange-600 underline"
      >
        Create your first template
      </a>
    </p>
  </div>
);

// Sub-component for templates header section
const TemplatesHeader = ({ userId }) => (
  <>
    <h1 className="text-3xl font-bold mb-2">My Meal Plan Templates</h1>
    <p className="text-gray-600 mb-8">
      Apply a template to quickly set up your weekly meal plan.
    </p>
    <div className="mb-6">
      <a 
        href={`/dashboard/grid/${userId}`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
      >
        <PlusCircle className="h-4 w-4" />
        Create New Template
      </a>
    </div>
  </>
);

// Sub-component for templates grid
const TemplatesGrid = ({ templates, userId, onTemplateClick, onImportTemplate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map(template => (
        <TemplateCard
          key={template._id}
          template={template}
          onClick={() => onTemplateClick(template)}
          onImport={() => onImportTemplate(template._id)}
          isOwner={template.user_id === userId}
        />
      ))}
    </div>
  );
};

export default function TemplatesPage({ userId, templates: initialTemplates }) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates || []);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();

  // Fetch templates if needed
  useEffect(() => {
    const fetchTemplatesData = async () => {
      if (!initialTemplates) {
        setIsLoading(true);
        try {
          const fetchedTemplates = await getTemplates(userId);
          setTemplates(fetchedTemplates);
        } catch (error) {
          console.error('Error fetching templates:', error);
          showNotification('Failed to load templates', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTemplatesData();
  }, [userId, initialTemplates, showNotification]);

  // Template handlers
  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const handleImportTemplate = async (templateId) => {
    try {
      setIsLoading(true);
      await importTemplate(templateId, userId);
      showNotification('Template applied successfully', 'success');
      router.push(`/dashboard/grid/${userId}`);
    } catch (error) {
      console.error('Error importing template:', error);
      showNotification('Failed to apply template', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = (templateId) => {
    setTemplateToDelete(templateId);
    setShowDeleteConfirm(true);
  };
  
  const performTemplateDelete = async () => {
    if (!templateToDelete) return;
    
    try {
      setIsLoading(true);
      await deleteTemplate(templateToDelete, userId);
      
      // Update templates list locally
      setTemplates(prevTemplates => 
        prevTemplates.filter(t => t._id !== templateToDelete)
      );
      
      // Close modal if showing the deleted template
      if (selectedTemplate && selectedTemplate._id === templateToDelete) {
        setShowModal(false);
      }
      
      showNotification('Template deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting template:', error);
      showNotification(`Failed to delete template: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setTemplateToDelete(null);
    }
  };

  // Filtering logic - just show user's own templates to simplify
  const userTemplates = templates.filter(template => template.user_id === userId);

  return (
    <div className="container mx-auto px-4 py-8">
      <TemplatesHeader userId={userId} />
      
      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading templates...</p>
        </div>
      ) : userTemplates.length > 0 ? (
        <TemplatesGrid 
          templates={userTemplates}
          userId={userId}
          onTemplateClick={handleTemplateClick}
          onImportTemplate={handleImportTemplate}
        />
      ) : (
        <EmptyTemplatesView userId={userId} />
      )}
      
      {/* Template Detail Modal */}
      {showModal && selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          onClose={() => setShowModal(false)}
          onImport={() => handleImportTemplate(selectedTemplate._id)}
          onDelete={selectedTemplate.user_id === userId ? 
                  () => handleDeleteTemplate(selectedTemplate._id) : 
                  undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={performTemplateDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmButtonClass="bg-red-500 hover:bg-red-600 text-white"
      />

      {/* Notification Toast */}
      <NotificationToast
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </div>
  );
}