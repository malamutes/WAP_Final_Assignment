import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const CreatePost = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const res = await fetch('http://localhost:3000/post/addPost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, tags }),
                credentials: 'include'
            });

            const reply = await res.json();
            if (res.ok) {
                navigate('/post/myPosts');
            } else {
                console.error(res.status, reply.message)
                alert("You need to be logged in to make a post!");
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong.');
        }
    };


    return (
        <div className="container-fluid d-flex align-items-center justify-content-center">
            <div className="row w-100">
                <div className="col-md-3 mx-auto">
                    <h3>Create New Post!</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="title">Title:</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="form-control"
                                placeholder="Enter title"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="content">Content:</label>
                            <textarea
                                id="content"
                                name="content"
                                className="form-control"
                                placeholder="Enter content"
                                required
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="tags">Tags (Comma separated):</label>
                            <textarea
                                id="tags"
                                name="tags"
                                className="form-control"
                                placeholder="Enter tags separated by commas"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary">Create Post</button>
                    </form>

                    <button onClick={() => navigate('/myPosts')} className="btn me-3 btn-secondary mt-3">
                        Back to My Posts
                    </button>

                    <button onClick={() => navigate('/')} className="btn btn-secondary mt-3">
                        Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
