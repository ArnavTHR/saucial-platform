// Check authentication on page load
const token = localStorage.getItem('saucial_token');
const user = JSON.parse(localStorage.getItem('saucial_user'));

if (!token) {
    window.location.href = '/login.html'; // Redirect if not logged in
} else {
    document.getElementById('userInfo').innerText = `Logged in as: ${user.active_name}`;
    loadPosts();
}

function logout() {
    localStorage.removeItem('saucial_token');
    localStorage.removeItem('saucial_user');
    window.location.href = '/login.html';
}

let currentCategory = 'All';

// Update loadPosts to accept a query string

async function loadPosts(category = 'All') {
    try {
        const url = category === 'All'
            ? 'http://localhost:5000/api/posts'
            : `http://localhost:5000/api/posts?category=${category}`;

        const response = await fetch(url);
        const posts = await response.json();

        const feed = document.getElementById('feedContainer');
        feed.innerHTML = '';

        if (posts.length === 0) {
            feed.innerHTML = '<p>No posts found in this category.</p>';
            return;
        }

        posts.forEach(post => {
            const authorName = post.use_anonymous ? post.anonymous_name : post.real_name;
            const flairColor = post.flair === 'faculty' ? '#dc3545' : (post.flair === 'staff' ? '#28a745' : '#007bff');

            const postHTML = `
                <div class="card">
                    <div class="post-header">
                        Posted by <strong>${authorName}</strong>
                        <span class="flair" style="background-color: ${flairColor}">${post.flair}</span>
                        • Category: ${post.category}
                    </div>

                    <h2 class="post-title">${post.title}</h2>
                    <p>${post.content}</p>

                    <div class="post-actions">
                        <button onclick="vote(${post.id}, 'upvote')" style="background:none; color:inherit; border:none; padding:0; cursor:pointer;">
                            ⬆️ <span id="upvotes-${post.id}">${post.upvotes}</span>
                        </button>

                        <button onclick="vote(${post.id}, 'downvote')" style="background:none; color:inherit; border:none; padding:0; cursor:pointer; margin-left: 10px;">
                            ⬇️ <span id="downvotes-${post.id}">${post.downvotes}</span>
                        </button>

                        <button onclick="toggleComments(${post.id})" style="background:none; color:inherit; border:none; padding:0; cursor:pointer; margin-left: 15px;">
                            💬 Comments
                        </button>
                    </div>

                    <!-- Hidden Comment Section -->
                    <div id="comments-section-${post.id}" style="display: none; margin-top: 15px; border-top: 1px solid #ccc; padding-top: 10px;">
                        <div id="comments-list-${post.id}" style="margin-bottom: 10px; font-size: 14px;"></div>

                        <form onsubmit="submitComment(event, ${post.id})" style="display: flex; gap: 10px;">
                            <input type="text" id="comment-input-${post.id}" placeholder="Add a comment..." required style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">

                            <button type="submit" style="padding: 8px 15px;">Reply</button>
                        </form>
                    </div>
                </div>
            `;

            feed.innerHTML += postHTML;
        });
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}


// NEW: Handle tab switching and styling
function filterCategory(category) {
    currentCategory = category;
    
    // Update active button styles
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText === category) btn.classList.add('active');
    });

    loadPosts(category);
}

// Handle Creating a New Post
// Handle Creating a New Post
document.getElementById('createPostForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        title: document.getElementById('postTitle').value,
        content: document.getElementById('postContent').value,
        category: document.getElementById('postCategory').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            document.getElementById('createPostForm').reset();
            loadPosts(currentCategory); // UPDATED: Reloads the active category tab
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to create post');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
// Handle Voting
async function vote(postId, action) {
    if (!token) {
        alert('You must be logged in to vote.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/posts/${postId}/vote`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ action })
        });

        if (response.ok) {
            const updatedPost = await response.json();
            // Dynamically update the DOM without reloading the page
            document.getElementById(`upvotes-${postId}`).innerText = updatedPost.upvotes;
            document.getElementById(`downvotes-${postId}`).innerText = updatedPost.downvotes;
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to register vote.');
        }
    } catch (error) {
        console.error('Error voting:', error);
    }
}

// Toggle comment section visibility and fetch comments
async function toggleComments(postId) {
    const section = document.getElementById(`comments-section-${postId}`);
    const list = document.getElementById(`comments-list-${postId}`);
    
    // If it is currently hidden, fetch the data and display it
    if (section.style.display === 'none') {
        section.style.display = 'block';
        list.innerHTML = '<em>Loading comments...</em>';
        
        try {
            const response = await fetch(`http://localhost:5000/api/comments/${postId}`);
            const comments = await response.json();
            
            list.innerHTML = '';
            if (comments.length === 0) {
                list.innerHTML = '<div style="color: #787c7e;">No comments yet. Be the first!</div>';
            } else {
                comments.forEach(c => {
                    const authorName = c.use_anonymous ? c.anonymous_name : c.real_name;
                    const flairColor = c.flair === 'faculty' ? '#dc3545' : (c.flair === 'staff' ? '#28a745' : '#007bff');
                    list.innerHTML += `
                        <div style="background: #f8f9fa; padding: 8px; margin-bottom: 5px; border-radius: 4px;">
                            <strong style="font-size: 12px;">${authorName} <span class="flair" style="background-color: ${flairColor}">${c.flair}</span></strong>
                            <div style="margin-top: 4px;">${c.content}</div>
                        </div>
                    `;
                });
            }
        } catch (error) {
            list.innerHTML = '<div style="color: red;">Failed to load comments.</div>';
        }
    } else {
        section.style.display = 'none';
    }
}

// Handle submitting a new comment
async function submitComment(e, postId) {
    e.preventDefault();
    if (!token) return alert('You must be logged in to comment.');

    const inputField = document.getElementById(`comment-input-${postId}`);
    const content = inputField.value;

    try {
        const response = await fetch('http://localhost:5000/api/comments', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ post_id: postId, content })
        });

        if (response.ok) {
            inputField.value = '';
            // Force a reload of the comment list by toggling it off and on
            document.getElementById(`comments-section-${postId}`).style.display = 'none';
            toggleComments(postId);
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to add comment.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}