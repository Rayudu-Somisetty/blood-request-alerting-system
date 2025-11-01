import React, { useState, useEffect } from 'react';

const EmailTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch('/api/notifications/templates');
                if (!response.ok) {
                    throw new Error('Failed to fetch templates');
                }
                const data = await response.json();
                setTemplates(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    const handleEdit = (templateId) => {
        // Logic for editing a template
    };

    const handleDelete = async (templateId) => {
        try {
            const response = await fetch(`/api/notifications/templates/${templateId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete template');
            }
            setTemplates(templates.filter(template => template.id !== templateId));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Email Templates</h2>
            <ul>
                {templates.map(template => (
                    <li key={template.id}>
                        <h3>{template.name}</h3>
                        <p>{template.content}</p>
                        <button onClick={() => handleEdit(template.id)}>Edit</button>
                        <button onClick={() => handleDelete(template.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EmailTemplates;