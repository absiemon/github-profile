
// Declaring global variables
let totalRepos = 0; //Total repository
let customParam // User parameter
let currentPage = 1 // Current page number
let reposPerPage = 10 // Default repositories per page
let repositoryData = [] // Caching data for searching repos by name


// ---------------------Function to display repositories----------------------------------
function displayRepos(repos) {
	// Get repository list container
	const repoListContainer = document.getElementById('repoList')
	repoListContainer.innerHTML = '' // Clear existing repo list

	// Check if repositories are available
	if (!repos || repos.length === 0) {
		console.warn('No repositories found for the user.')
		return
	}

	// Iterate through paginated repositories
	for (const repo of repos) {
		// Create repository card element
		const repoCard = document.createElement('div')
		repoCard.className =
			'p-4 rounded shadow transition transform hover:scale-105'
		repoCard.style="background-color: #083156; color: #D1FAE5;"

		repoCard.innerHTML = `
            <h2 class="text-xl font-semibold mb-2">${repo.name}</h2>
            <p class="mb-2">${repo.description || 'No description'}</p>
            <div class="flex">
                <span class=" px-2 py-1 rounded mr-2" style="background-color: #D1FAE5;color: #083156;">
                    ${repo.language || 'Unknown'}
                </span>
            </div>
        `
		repoListContainer.appendChild(repoCard)
	}
}


// -------------------------Function to change repositories per page----------------------------
function changeReposPerPage(value) {
	reposPerPage = parseInt(value, 10)
	
	//show loder when repos are being fetched
	document.getElementById('repositoryLoading').style.display = 'flex';
	document.getElementById('repoList').style.display = 'none';
	// Fetching repos data and displaying it.
	const urlParams = new URLSearchParams(window.location.search)
	customParam = urlParams.get('user')
	Promise.all([fetchUserData(`${customParam}/repos?per_page=${reposPerPage}&page=${currentPage}`)])
	.then(([reposData]) => {
		// making display none of loader after repos are fetched
		document.getElementById('repositoryLoading').style.display = 'none';
		// Show main content container
		document.getElementById('repoList').style.display = '';

		displayRepos(reposData)
	})
}


// ---------------------Function to filter repositories by name--------------------------
function filterReposByName(name, repos) {
	const filteredRepos = repos.filter(repo =>
		repo.name.toLowerCase().includes(name.toLowerCase())
	)
	displayRepos(filteredRepos)
}


// --------------------Function to fetch user data from GitHub API----------------------------
function fetchUserData(username) {
	const apiUrl = `https://api.github.com/users/${username}`
	return fetch(apiUrl)
		.then(response => response.json())
		.catch(error => {
			console.error('Error fetching user data:', error)
			return null
		})
}


// --------------------Event listener when DOM content is loaded-----------------------
document.addEventListener('DOMContentLoaded', function () {
	// Get username parameter from URL
	const urlParams = new URLSearchParams(window.location.search)
	customParam = urlParams.get('user') // Assign value to customParam

	// Check if username is available
	if (!customParam) {
		console.error('Username not found in the URL.')
		return
	}

	// Show loading indicators

	document.getElementById('followers').innerHTML = 
	`
	<img src='./assets/loader-2.gif' alt="icon" class="h-7 w-7"/>
	`
	document.getElementById('following').innerHTML = 
	`
	<img src='./assets/loader-2.gif' alt="icon" class="h-7 w-7"/>
	`
	document.getElementById('publicRepos').innerHTML = 
	`
	<img src='./assets/loader-2.gif' alt="icon" class="h-7 w-7"/>
	`

	// Fetch user data and repositories
	Promise.all([fetchUserData(customParam), fetchUserData(`${customParam}/repos?per_page=${reposPerPage}&page=${currentPage}`)])
		.then(([userData, reposData]) => {
			// Populate user information
			document.getElementById('userProfilePicture').src =
				userData?.avatar_url || 'placeholder_image_url'
			document.getElementById('username').innerText = userData?.login || 'Username'
			document.getElementById('userBio').innerText = userData?.bio || 'No bio available'
			document.getElementById('githubProfileLink').href = userData?.html_url || '#'
			totalRepos = userData?.public_repos; 

			// Fetch and display additional user information
			document.getElementById('followers').innerText = userData?.followers || '0'
			document.getElementById('following').innerText = userData?.following || '0'
			document.getElementById('publicRepos').innerText =
				userData?.public_repos || '0'
			
			//Caching repo data 
			repositoryData = reposData

			// Removing Loader when data is fetched

			// making display none of loader after user is fetched
			document.getElementById('loadingContainer').style.display = 'none';
			// Show main content container
			document.getElementById('user_main_containter').style.display = 'block';

			// making display none of loader after user is fetched
			document.getElementById('repositoryLoading').style.display = 'none';
			// Show main content container
			document.getElementById('repoList').style.display = '';


			// Display repos based on the default repos per page value
			displayRepos(reposData)

			// generate pagination
			generatePagination();
		})
		.catch(error => {
			console.error('Error fetching user data:', error)
		})
})


// --------------------Function to handle input changes in the repository name field------------------
function handleRepoNameInput(value) {
	filterReposByName(value, repositoryData)
}


//----------------------Pagination Implementation--------------------------------------------------
const visiblePages = 5; 

function generatePagination() {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';
	
	const totalPages = Math.ceil(totalRepos / reposPerPage)

    // Add "Previous" button
    const prevButton = document.createElement('button');
    prevButton.innerText = '‹';
    prevButton.className = 'prev bg-blue-900 text-white px-4 py-2 rounded-l cursor-pointer';
    prevButton.onclick = prevPage;
    paginationContainer.appendChild(prevButton);

    // Add page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - Math.floor(visiblePages / 2) && i <= currentPage + Math.floor(visiblePages / 2))) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            pageButton.className = `page ${i === currentPage ? 'bg-blue-900 text-white' : 'bg-gray-300 hover:bg-gray-400'} px-4 py-2 rounded cursor-pointer`;
            pageButton.onclick = () => goToPage(i);
            paginationContainer.appendChild(pageButton);
        } 
		if (i === totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.innerText = '…';
            ellipsis.className = 'ellipsis text-gray-500 px-4 py-2 cursor-pointer';
            ellipsis.onclick = () => goToPage(currentPage + Math.floor(visiblePages / 2) + 1);
            paginationContainer.appendChild(ellipsis);
            ellipsisShown = true;
        }
    }

    // Add "Next" button
    const nextButton = document.createElement('button');
    nextButton.innerText = '›';
    nextButton.className = 'next bg-blue-900 text-white px-4 py-2 rounded-r cursor-pointer';
    nextButton.onclick = nextPage;
    paginationContainer.appendChild(nextButton);
}

//-------------------Function to handle particular page click--------------------- 
function goToPage(page) {
    currentPage = page;
    generatePagination();
    
	//show loder when repos are being fetched
	document.getElementById('repositoryLoading').style.display = 'flex';
	document.getElementById('repoList').style.display = 'none';

    // Fetching repos data and displaying it.
	const urlParams = new URLSearchParams(window.location.search)
	customParam = urlParams.get('user')
	Promise.all([fetchUserData(`${customParam}/repos?per_page=${reposPerPage}&page=${currentPage}`)])
	.then(([reposData]) => {

		// making display none of loader after repos are fetched
		document.getElementById('repositoryLoading').style.display = 'none';
		// Show main content container
		document.getElementById('repoList').style.display = '';

		//Caching repo data 
		repositoryData = reposData

		displayRepos(reposData)
	})
}


//-------------------Function to handle previous page click--------------------- 
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        generatePagination();
		
		//show loder when repos are being fetched
		document.getElementById('repositoryLoading').style.display = 'flex';
		document.getElementById('repoList').style.display = 'none';

    	// Fetching repos data and displaying it.
		const urlParams = new URLSearchParams(window.location.search)
		customParam = urlParams.get('user')
		Promise.all([fetchUserData(`${customParam}/repos?per_page=${reposPerPage}&page=${currentPage}`)])
		.then(([reposData]) => {

			// making display none of loader after repos are fetched
			document.getElementById('repositoryLoading').style.display = 'none';
			// Show main content container
			document.getElementById('repoList').style.display = '';

			//Caching repo data 
			repositoryData = reposData

			displayRepos(reposData)
		})
    }
}

//-------------------Function to handle next page click--------------------- 
function nextPage() {
	let totalPages = Math.ceil(totalRepos/reposPerPage)

    if (currentPage < totalPages) {
        currentPage++;
        generatePagination();

		//show loder when repos are being fetched
		document.getElementById('repositoryLoading').style.display = 'flex';
		document.getElementById('repoList').style.display = 'none';

        // Fetching repos data and displaying it.
		const urlParams = new URLSearchParams(window.location.search)
		customParam = urlParams.get('user')
		Promise.all([fetchUserData(`${customParam}/repos?per_page=${reposPerPage}&page=${currentPage}`)])
		.then(([reposData]) => {
			// making display none of loader after repos are fetched
			document.getElementById('repositoryLoading').style.display = 'none';
			// Show main content container
			document.getElementById('repoList').style.display = '';

			//Caching repo data 
			repositoryData = reposData

			displayRepos(reposData)
		})

    }
}












