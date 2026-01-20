'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Save, X, Check } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: ''
  });

  // Load templates from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadTemplates();
    }
  }, []);

  const loadTemplates = () => {
    try {
      const stored = localStorage.getItem('emailTemplates');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTemplates(parsed);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const saveTemplates = (updatedTemplates: Template[]) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates));
      }
      setTemplates(updatedTemplates);
      toast.success('Templates saved successfully');
    } catch (error) {
      console.error('Failed to save templates:', error);
      toast.error('Failed to save templates');
    }
  };

  const handleCreateTemplate = () => {
    if (!formData.name || !formData.subject || !formData.content) {
      toast.error('All fields are required');
      return;
    }

    const newTemplate: Template = {
      id: Date.now().toString(),
      name: formData.name,
      subject: formData.subject,
      content: formData.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedTemplates = [...templates, newTemplate];
    saveTemplates(updatedTemplates);

    setFormData({ name: '', subject: '', content: '' });
    setShowCreateModal(false);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !formData.name || !formData.subject || !formData.content) {
      toast.error('All fields are required');
      return;
    }

    const updatedTemplates = templates.map(template =>
      template.id === editingTemplate.id
        ? {
            ...template,
            name: formData.name,
            subject: formData.subject,
            content: formData.content,
            updatedAt: new Date().toISOString()
          }
        : template
    );

    saveTemplates(updatedTemplates);

    setFormData({ name: '', subject: '', content: '' });
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = templates.filter(template => template.id !== id);
      saveTemplates(updatedTemplates);
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content
    });
  };

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplates(prev =>
      prev.includes(id)
        ? prev.filter(tid => tid !== id)
        : [...prev, id]
    );
  };

  const handleUseSelectedTemplates = () => {
    if (selectedTemplates.length === 0) {
      toast.error('Please select at least one template');
      return;
    }

    const selectedTemplatesData = templates.filter(template =>
      selectedTemplates.includes(template.id)
    );

    // Store selected templates in localStorage for compose component to use
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedTemplates', JSON.stringify(selectedTemplatesData));
    }
    
    toast.success(`${selectedTemplates.length} template(s) ready to use in Compose`);
    
    // Navigate to compose page (if using routing)
    // window.location.href = '/compose';
  };

  const previewTemplate = (template: Template) => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(template.content);
      previewWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Email Templates</h1>
              <p className="text-gray-400">Create and manage email templates for quick composition</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg shadow-purple-500/25 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Template
            </button>
          </div>
        </div>

        {/* Selected Templates Actions */}
        {selectedTemplates.length > 0 && (
          <div className="bg-purple-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-700/50 shadow-xl mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {selectedTemplates.length} Template{selectedTemplates.length !== 1 ? 's' : ''} Selected
                </h3>
                <p className="text-purple-300 text-sm">Ready to use in Compose</p>
              </div>
              <button
                onClick={handleUseSelectedTemplates}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 font-medium flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Use Selected Templates
              </button>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedTemplates.includes(template.id)}
                    onChange={() => handleSelectTemplate(template.id)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                    <p className="text-gray-400 text-sm">{template.subject}</p>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="mb-4">
                <div className="bg-gray-900/50 rounded-lg p-3 h-32 overflow-hidden">
                  <p className="text-gray-300 text-sm line-clamp-4">
                    {template.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => previewTemplate(template)}
                    className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(template.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700/50 shadow-xl text-center">
            <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Templates Yet</h3>
            <p className="text-gray-400 mb-6">Create your first email template to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 font-medium"
            >
              Create Your First Template
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingTemplate) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                    setFormData({ name: '', subject: '', content: '' });
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-2 block">Template Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter template name..."
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm font-medium mb-2 block">Email Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter email subject..."
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm font-medium mb-2 block">Email Content (HTML)</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 h-64 resize-none"
                    placeholder="Enter email content (HTML supported)..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                    setFormData({ name: '', subject: '', content: '' });
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
