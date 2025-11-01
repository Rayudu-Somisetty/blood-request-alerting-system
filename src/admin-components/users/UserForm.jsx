import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, createUser, updateUser } from '../../admin-services/api';

const UserForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        role: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (id) {
            setIsEditing(true);
            const fetchUser = async () => {
                const response = await getUser(id);
                setUserData(response.data);
            };
            fetchUser();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await updateUser(id, userData);
        } else {
            await createUser(userData);
        }
        navigate('/users');
    };

    return (
        <div>
            <h2>{isEditing ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Role:</label>
                    <select
                        name="role"
                        value={userData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="donor">Donor</option>
                        <option value="staff">Staff</option>
                    </select>
                </div>
                <button type="submit">{isEditing ? 'Update' : 'Create'}</button>
            </form>
        </div>
    );
};

export default UserForm;