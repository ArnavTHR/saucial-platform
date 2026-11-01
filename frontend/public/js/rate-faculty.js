const token = localStorage.getItem('saucial_token');
let currentProfId = null;

// On load, fetch departments
document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch('http://localhost:5000/api/professors/departments');
    const depts = await res.json();
    const deptSelect = document.getElementById('deptSelect');
    depts.forEach(d => {
        deptSelect.innerHTML += `<option value="${d}">${d}</option>`;
    });
});

async function loadProfessors() {
    const dept = document.getElementById('deptSelect').value;
    const profSelectGroup = document.getElementById('profSelectGroup');
    const profSelect = document.getElementById('profSelect');
    
    document.getElementById('profProfile').style.display = 'none';
    
    if (!dept) {
        profSelectGroup.style.display = 'none';
        return;
    }

    const res = await fetch(`http://localhost:5000/api/professors/department/${encodeURIComponent(dept)}`);
    const profs = await res.json();
    
    profSelect.innerHTML = '<option value="">-- Choose Faculty --</option>';
    profs.forEach(p => {
        // Store stringified object in the value so we don't have to fetch it again
        profSelect.innerHTML += `<option value='${JSON.stringify(p)}'>${p.name}</option>`;
    });
    profSelectGroup.style.display = 'block';
}

function loadProfessorDetails() {
    const profDataStr = document.getElementById('profSelect').value;
    const profileDiv = document.getElementById('profProfile');
    
    if (!profDataStr) {
        profileDiv.style.display = 'none';
        return;
    }

    const prof = JSON.parse(profDataStr);
    currentProfId = prof.id;
    
    document.getElementById('profNameDisplay').innerText = prof.name;
    document.getElementById('avgRatingDisplay').innerText = Number(prof.avg_rating).toFixed(1);
    document.getElementById('reviewCountDisplay').innerText = prof.review_count;
    
    const imgElement = document.getElementById('profImgDisplay');
    // For MVP without uploaded images, use a placeholder
    imgElement.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(prof.name) + '&background=random';
    
    // Apply Glow/Color Logic
    imgElement.className = 'prof-img'; // Reset classes
    const avg = parseFloat(prof.avg_rating);
    
    if (prof.review_count > 0) {
        if (avg >= 4.9) imgElement.classList.add('glow-gold');
        else if (avg >= 4.0) imgElement.classList.add('glow-silver');
        else if (avg >= 3.0) imgElement.classList.add('circle-bronze');
        else if (avg >= 2.0) imgElement.classList.add('circle-white');
        else if (avg >= 1.0) imgElement.classList.add('circle-black');
        else imgElement.classList.add('circle-red');
    } else {
        imgElement.classList.add('circle-white'); // Default for no reviews
    }

    profileDiv.style.display = 'block';
    fetchReviews(prof.id);
}

async function fetchReviews(profId) {
    const res = await fetch(`http://localhost:5000/api/professors/${profId}/reviews`);
    const reviews = await res.json();
    const list = document.getElementById('reviewsList');
    
    list.innerHTML = '';
    if (reviews.length === 0) {
        list.innerHTML = '<p>No reviews yet.</p>';
    } else {
        reviews.forEach(r => {
            list.innerHTML += `
                <div class="review-box">
                    <div style="font-weight: bold; margin-bottom: 5px;">⭐ ${r.rating} / 5</div>
                    <div>${r.comment}</div>
                    <div style="font-size: 11px; color: #888; margin-top: 5px;">${new Date(r.created_at).toLocaleDateString()}</div>
                </div>
            `;
        });
    }
}

async function submitReview(e) {
    e.preventDefault();
    if (!token) return alert('You must be logged in to submit a review.');

    const rating = document.getElementById('ratingInput').value;
    const comment = document.getElementById('commentInput').value;

    const res = await fetch(`http://localhost:5000/api/professors/${currentProfId}/reviews`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ rating, comment })
    });

    if (res.ok) {
        alert('Review submitted anonymously.');
        document.getElementById('ratingInput').value = '';
        document.getElementById('commentInput').value = '';
        
        // Refresh the department to pull the new calculated averages, then re-select the professor
        await loadProfessors();
        fetchReviews(currentProfId);
    } else {
        const data = await res.json();
        alert(data.message || 'Failed to submit review');
    }
}