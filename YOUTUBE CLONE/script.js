
const API_KEY = "AIzaSyBaIs3inXYy1xqiicK-CGUdY6KPkQhh2E4";

const videoContainer = document.getElementById("videoContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const heading = document.getElementById("heading");

const modal = document.getElementById("playerModal");
const videoPlayer = document.getElementById("videoPlayer");
const closePlayer = document.getElementById("closePlayer");

// Escape API text before inserting it into HTML
function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// YouTube API search function
async function getVideos(query = "trending videos") {
    heading.textContent = `Results for: ${query}`;
    videoContainer.innerHTML = "<p>Loading videos...</p>";

    if (!API_KEY || API_KEY === "YOUR_API_KEY") {
        videoContainer.innerHTML =
            "<p>Please add your YouTube API key in script.js.</p>";
        return;
    }

    const url =
        `https://www.googleapis.com/youtube/v3/search` +
        `?part=snippet&type=video&maxResults=20` +
        `&q=${encodeURIComponent(query)}` +
        `&key=${encodeURIComponent(API_KEY)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error?.message || "YouTube API request failed"
            );
        }

        if (!data.items || data.items.length === 0) {
            videoContainer.innerHTML = "<p>No videos found.</p>";
            return;
        }

        displayVideos(data.items);

    } catch (error) {
        console.error(error);
        videoContainer.innerHTML =
            `<p>Unable to load videos: ${escapeHTML(error.message)}</p>`;
    }
}

// Display video cards
function displayVideos(videos) {
    videoContainer.innerHTML = "";

    videos.forEach(video => {
        const videoId = video.id.videoId;
        const title = video.snippet.title;
        const channel = video.snippet.channelTitle;
        const thumbnail =
            video.snippet.thumbnails.high?.url ||
            video.snippet.thumbnails.medium?.url;

        const card = document.createElement("div");
        card.className = "video-card";

        card.innerHTML = `
            <img class="thumbnail"
                 src="${escapeHTML(thumbnail)}"
                 alt="${escapeHTML(title)}">

            <div class="video-info">
                <img class="channel-icon"
                     src="https://ui-avatars.com/api/?name=${encodeURIComponent(channel)}&background=333&color=fff"
                     alt="Channel">

                <div>
                    <p class="video-title">
                        ${escapeHTML(title)}
                    </p>

                    <p class="channel-name">
                        ${escapeHTML(channel)}
                    </p>

                    <p class="video-date">
                        YouTube Video
                    </p>
                </div>
            </div>
        `;

        card.addEventListener("click", () => {
            openVideo(videoId);
        });

        videoContainer.appendChild(card);
    });
}

// Open video player
function openVideo(videoId) {
    videoPlayer.src =
        `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1`;

    modal.classList.add("show");
}

// Close video player
function closeVideo() {
    modal.classList.remove("show");
    videoPlayer.src = "";
}

closePlayer.addEventListener("click", closeVideo);

modal.addEventListener("click", event => {
    if (event.target === modal) {
        closeVideo();
    }
});

// Search button
searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();

    if (query) {
        getVideos(query);
    }
});

// Search using Enter key
searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});

// Category buttons
document.querySelectorAll(".chip").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".chip")
            .forEach(chip => chip.classList.remove("selected"));

        button.classList.add("selected");
        getVideos(button.dataset.query);
    });
});

// Sidebar buttons
document.querySelectorAll(".menu").forEach(menu => {
    menu.addEventListener("click", () => {
        document.querySelectorAll(".menu")
            .forEach(item => item.classList.remove("active"));

        menu.classList.add("active");
        getVideos(menu.dataset.query);
    });
});

// Load default videos
getVideos("trending videos");
