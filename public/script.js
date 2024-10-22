document.addEventListener('DOMContentLoaded', () => {
    const createNewScriptBtn = document.querySelector('.primary-button');
    const reviewExistingScriptBtn = document.querySelector('.secondary-button');
    const productForm = document.getElementById('product-form');
    const resubmitBtn = document.getElementById('resubmit-btn');
    const loadingSpinner = document.getElementById('loading-spinner');

    if (createNewScriptBtn) {
        createNewScriptBtn.addEventListener('click', () => {
            window.location.href = 'createnewscript.html';
        });
    }

    if (reviewExistingScriptBtn) {
        reviewExistingScriptBtn.addEventListener('click', () => {
            // Navigate to the Review Existing Script page
            console.log('Navigate to Review Existing Script page');
            // Implement navigation logic here
        });
    }

    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loadingSpinner.classList.remove('hidden');
            const productLink = document.getElementById('product-link').value;
            const analysis = await fetchProductAnalysis(productLink);
            loadingSpinner.classList.add('hidden');
            if (analysis) {
                // Store the analysis in localStorage for the results page
                localStorage.setItem('productAnalysis', JSON.stringify(analysis));
                window.location.href = 'displayresults.html';
            }
        });
    }

    if (resubmitBtn) {
        resubmitBtn.addEventListener('click', () => {
            window.location.href = 'createnewscript.html';
        });
    }

    // Check if we're on the results page and populate the data
    if (document.querySelector('.results-page')) {
        const storedAnalysis = localStorage.getItem('productAnalysis');
        if (storedAnalysis) {
            const analysis = JSON.parse(storedAnalysis);
            populateResults(analysis);
        }
    }
});

async function fetchProductAnalysis(productLink) {
    try {
        const response = await fetch('/analyze-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productLink }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch product analysis');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

function populateResults(data) {
    document.getElementById('overview-list').innerHTML = data.productOverview.map(item => `<li>${item}</li>`).join('');
    document.getElementById('features-list').innerHTML = data.keyFeatures.map(item => `<li>${item}</li>`).join('');
    document.getElementById('positive-list').innerHTML = data.customerFeedback.positives.map(item => `<li>${item}</li>`).join('');
    document.getElementById('negative-list').innerHTML = data.customerFeedback.concerns.map(item => `<li>${item}</li>`).join('');
    document.getElementById('talking-points-list').innerHTML = data.keyTalkingPoints.map(item => `<li>${item}</li>`).join('');
}
