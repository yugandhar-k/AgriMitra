document.addEventListener('DOMContentLoaded', function() {

    let isLoggedIn = false;
    let currentUser = null;

    // --- Page Navigation ---
    const pages = document.querySelectorAll('main > div');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenu = document.getElementById('mobile-menu');

    window.showPage = function(pageId) {
        if (pageId === 'recommendation' && !isLoggedIn) {
            document.getElementById('login-signup-section').classList.remove('hidden');
            document.getElementById('recommendation-system-section').classList.add('hidden');
            document.getElementById('signup-form-container').classList.remove('hidden');
            document.getElementById('login-form-container').classList.add('hidden');
        } else if (pageId === 'recommendation' && isLoggedIn) {
            document.getElementById('login-signup-section').classList.add('hidden');
            document.getElementById('recommendation-system-section').classList.remove('hidden');
        }

        pages.forEach(page => {
            page.classList.toggle('hidden-page', page.id !== `page-${pageId}`);
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('onclick') === `showPage('${pageId}')`) {
                link.classList.add('active');
            }
        });

        mobileMenu.classList.add('hidden');
        window.scrollTo(0, 0);

        if (pageId === 'gardening') {
            const layoutContainer = document.getElementById('gardening-layout-container');
            layoutContainer.classList.remove('hidden');
            layoutContainer.classList.add('initial-view');
            layoutContainer.classList.remove('results-view');
            document.getElementById('garden-plan-results').classList.add('hidden');
            document.getElementById('gardening-form-wrapper').classList.remove('hidden');
            document.getElementById('garden-loader').classList.add('hidden');
        }
        if (pageId === 'automation') {
            createAutomationCharts();
        }
        if (pageId === 'crop-study') {
            // Reset to initial state when navigating to the page
            document.getElementById('crop-selector').value = '';
            displayCropInfo('');
        }
    }

    document.getElementById('mobile-menu-button').addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // --- Home Page Slider ---
    const sliderItems = document.querySelectorAll('.slider-item');
    if (sliderItems.length > 0) {
        const prevButton = document.getElementById('prev-slide');
        const nextButton = document.getElementById('next-slide');
        const dotsContainer = document.getElementById('slider-dots');
        let currentSlide = 0;
        let slideInterval = setInterval(nextSlide, 5000);

        sliderItems.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'w-3 h-3 rounded-full bg-white/50 transition hover:bg-white';
            dot.addEventListener('click', () => {
                goToSlide(i);
                resetInterval();
            });
            dotsContainer.appendChild(dot);
        });
        const sliderDots = dotsContainer.querySelectorAll('button');

        function goToSlide(slideIndex) {
            currentSlide = (slideIndex + sliderItems.length) % sliderItems.length;
            sliderItems.forEach((slide, index) => {
                slide.classList.toggle('opacity-100', index === currentSlide);
                slide.classList.toggle('opacity-0', index !== currentSlide);
            });
            sliderDots.forEach((dot, index) => {
                dot.classList.toggle('bg-white', index === currentSlide);
                dot.classList.toggle('bg-white/50', index !== currentSlide);
            });
        }
        function nextSlide() { goToSlide(currentSlide + 1); }
        function prevSlide() { goToSlide(currentSlide - 1); }
        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        }
        nextButton.addEventListener('click', () => { nextSlide(); resetInterval(); });
        prevButton.addEventListener('click', () => { prevSlide(); resetInterval(); });
        goToSlide(0);
    }

    // --- Fade-in on Scroll ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // --- CROP STUDY DATA AND LOGIC (MERGED) ---
    const cropData = {
        tomato: { name: 'Tomato', stages: [ { name: '1. Planting', days: '0-5', img: 'images/tomato-planting.jpg' }, { name: '2. Germination', days: '5-12', img: 'images/tomato-germination.jpg' }, { name: '3. Vegetative', days: '12-30', img: 'images/tomato-vegetation.jpg' }, { name: '4. Flowering', days: '30-50', img: 'images/tomato-flowering.jpg' }, { name: '5. Harvest', days: '50+', img: 'images/tomato-harvest.jpg' } ], info: 'Tomatoes are nutrient-hungry plants that thrive in aeroponic systems. They require high levels of potassium and phosphorus during their flowering and fruiting stages. Good support or trellising is essential as they grow.', risks: 'Common issues include blossom end rot (a sign of calcium deficiency) and pests like spider mites. Ensuring good air circulation is key to preventing fungal diseases like powdery mildew.', video: 'https://www.youtube.com/embed/5i0s_R8Q2zQ' },
        potato: { name: 'Potato', stages: [ { name: '1. Planting', days: '0', img: 'images/potato-planting.jpg' }, { name: '2. Sprouting', days: '0-10', img: 'images/potato-sprouting.jpg' }, { name: '3. Vegetative', days: '10-30', img: 'images/potato-vegetative.jpg' }, { name: '4. Tuber Bulking', days: '30-70', img: 'images/potato-tuberbulking.jpg' }, { name: '5. Harvest', days: '70-100+', img: 'images/potato-harveest.jpg' } ], info: 'Growing potatoes aeroponically is highly efficient and clean. The system allows for easy monitoring of tuber growth. A nutrient solution higher in potassium is needed during the tuber bulking phase to encourage larger yields.', risks: 'Potatoes are susceptible to blight and scab. Maintaining a sterile environment is critical in aeroponics to prevent these diseases from taking hold. Ensure good ventilation to keep foliage dry.', video: 'https://www.youtube.com/embed/vmaDw0I4hP0' },
        lettuce: { name: 'Lettuce', stages: [ { name: '1. Planting', days: '0-3', img: 'images/lettuce-planting.jpg' }, { name: '2. Germination', days: '3-7', img: 'images/lettuce-Germination.jpg' }, { name: '3. Seedling', days: '7-15', img: 'images/lettuce-seedling.jpg' }, { name: '4. Vegetative', days: '15-40', img: 'images/lettuce-vegetative.jpg' }, { name: '5. Harvest', days: '40+', img: 'images/lettuce-harvest.jpg' }, ], info: 'Lettuce is a perfect crop for beginners in aeroponics due to its rapid growth cycle. It prefers a balanced nutrient solution with plenty of nitrogen to encourage lush leaf growth. Maintain a pH between 6.0 and 7.0.', risks: 'Tip burn, caused by calcium deficiency or poor transpiration, is a common problem. Root rot can occur if the water temperature gets too high. Watch out for aphids.', video: 'https://www.youtube.com/embed/g_p8h424-rI' },
        cauliflower: { name: 'Cauliflower', stages: [ { name: '1. Planting', days: '0-7', img: 'images/cauliflower-planting.jpg' }, { name: '2. Germination', days: '7-12', img: 'images/cauliflower-germination.jpg' }, { name: '3. Vegetative', days: '12-40', img: 'images/cauliflower-vegetation.jpg' }, { name: '4. Head Formation', days: '40-60', img: 'images/cauliflower-head.jpg' }, { name: '5. Harvest', days: '60+', img: 'images/cauliflower-harvest.jpg' } ], info: 'Cauliflower is a cool-weather crop that requires consistent moisture and nutrients, especially boron, to prevent hollow stems. It grows well in traditional soil with good drainage.', risks: 'Susceptible to cabbage worms and aphids. The head can "bolt" (flower prematurely) if stressed by heat or inconsistent watering.', video: 'https://www.youtube.com/embed/eOplMNUIw5U' },
        onion: { name: 'Onion', stages: [ { name: '1. Planting', days: '0-10', img: 'images/onion-planting.jpg' }, { name: '2. Sprouting', days: '10-20', img: 'images/onion-sprouting.jpg' }, { name: '3. Vegetative', days: '20-70', img: 'images/onion-vegetative.jpg' }, { name: '4. Bulb Formation', days: '70-100', img: 'images/onion-bulb.jpg' }, { name: '5. Harvest', days: '100+', img: 'images/onion-harvest.jpg' } ], info: 'Onions are root vegetables that need well-drained, loose soil. The bulbing process is triggered by day length, so choosing the right variety for your region is crucial.', risks: 'Prone to onion maggots and fungal diseases like downy mildew in damp conditions. Proper spacing is key for air circulation.', video: 'https://www.youtube.com/embed/li43uL14u_0' },
    };

    const cropSelector = document.getElementById('crop-selector');
    const cropDetailsContainer = document.getElementById('crop-details-container');
    const cropShowcaseContainer = document.getElementById('crop-showcase-container');

    function displayCropInfo(cropKey) {
        if (!cropKey || !cropData[cropKey]) {
            cropDetailsContainer.classList.add('hidden');
            cropShowcaseContainer.classList.remove('hidden');
            return;
        }

        cropShowcaseContainer.classList.add('hidden');
        cropDetailsContainer.classList.remove('hidden');
        cropDetailsContainer.classList.add('card'); // Ensure it has the card styling

        const data = cropData[cropKey];
        if (!data) return;

        const stagesHtml = data.stages.map((stage, index) => `
            <div class="growth-stage-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                <p class="font-bold text-lg">${stage.name}</p>
                <p class="text-sm text-gray-500">Days: ${stage.days}</p>
            </div>
        `).join('');

        cropDetailsContainer.innerHTML = `
            <div class="text-center mb-8">
                <img id="crop-stage-image" src="${data.stages[0].img}" alt="${data.stages[0].name}" class="rounded-xl shadow-lg mx-auto transition-opacity duration-500 w-full object-contain max-h-[500px]">
            </div>
            <div class="flex flex-wrap justify-center border-y my-6">
                ${stagesHtml}
            </div>
            <div class="grid md:grid-cols-2 gap-8 mt-8 pt-8 border-t">
                <div>
                    <h4 class="font-bold text-2xl mb-3 text-green-800">Growth Information</h4>
                    <p class="text-gray-700 leading-relaxed">${data.info}</p>
                    <h4 class="font-bold text-2xl mt-6 mb-3 text-amber-600">Common Risks & Prevention</h4>
                    <p class="text-gray-700 leading-relaxed">${data.risks}</p>
                </div>
                <div class="aspect-w-16 aspect-h-9">
                    <iframe class="w-full h-full rounded-lg shadow-md" src="${data.video}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
        `;

        const stageItems = cropDetailsContainer.querySelectorAll('.growth-stage-item');
        const stageImage = document.getElementById('crop-stage-image');

        stageItems.forEach(item => {
            item.addEventListener('click', () => {
                const index = item.getAttribute('data-index');
                stageItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                stageImage.style.opacity = '0';
                setTimeout(() => {
                    stageImage.src = data.stages[index].img;
                    stageImage.alt = data.stages[index].name;
                    stageImage.style.opacity = '1';
                }, 400);
            });
        });
    }

    if (cropSelector) {
        cropSelector.addEventListener('change', (e) => displayCropInfo(e.target.value));
    }

    // --- Home Gardening Planner Logic (FIXED & MERGED) ---
    const gardenPlannerForm = document.getElementById('garden-planner-form');
    const addGardenCropBtn = document.getElementById('add-garden-crop-btn');
    const gardenCropInputs = document.getElementById('garden-crop-inputs');
    const gardenPlanResults = document.getElementById('garden-plan-results');
    const allocModeToggle = document.getElementById('alloc-mode-toggle');
    const remainingLandText = document.getElementById('remaining-land-text');
    const layoutContainer = document.getElementById('gardening-layout-container');
    const gardenLoader = document.getElementById('garden-loader');

    const gardenCropDetails = {
        tomato: { name: 'Tomatoes', water: 0.8, days: 70, pest: 'Soap & Neem Oil Spray', profit: 40, icon: '🍅', color: 'rgba(239, 68, 68, 0.6)' },
        potato: { name: 'Potatoes', water: 0.6, days: 90, pest: 'Neem Cake & Good Drainage', profit: 30, icon: '🥔', color: 'rgba(217, 119, 6, 0.6)' },
        lettuce: { name: 'Lettuce', water: 0.5, days: 50, pest: 'Diluted Soap Solution', profit: 55, icon: '🥬', color: 'rgba(34, 197, 94, 0.6)' },
        cauliflower: { name: 'Cauliflower', water: 0.7, days: 60, pest: 'BT Spray (Organic)', profit: 45, icon: '🥦', color: 'rgba(163, 230, 53, 0.6)' },
        onion: { name: 'Onions', water: 0.4, days: 100, pest: 'Crop Rotation & Sticky Traps', profit: 35, icon: '🧅', color: 'rgba(251, 191, 36, 0.6)' },
    };

    function createGardenCropInput() {
        const div = document.createElement('div');
        div.className = 'grid grid-cols-6 gap-2 items-center';
        div.innerHTML = `
            <select class="garden-crop-select col-span-3 w-full p-2 border-0 rounded-md bg-white/20 text-white focus:ring-2 focus:ring-green-400">
                <option class="text-black" value="tomato">Tomato</option>
                <option class="text-black" value="lettuce">Lettuce</option>
                <option class="text-black" value="potato">Potato</option>
                <option class="text-black" value="cauliflower">Cauliflower</option>
                <option class="text-black" value="onion">Onion</option>
                <option class="text-black" value="strawberry">Strawberry</option>
                <option class="text-black" value="pepper">Bell Pepper</option>
            </select>
            <input type="number" class="garden-crop-value col-span-2 w-full p-2 border-0 rounded-md bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-green-400" placeholder="Value">
            <span class="text-white font-semibold text-center value-unit">sq ft</span>
        `;
        gardenCropInputs.appendChild(div);
        updateRemainingLand(); // Update text when new input is added
    }

    function updateRemainingLand() {
        const totalArea = parseFloat(document.getElementById('garden-land-area').value) || 0;
        if (totalArea === 0) {
            remainingLandText.textContent = 'Please enter a total land area.';
            return;
        }
        const isPercentMode = allocModeToggle.checked;
        let usedValue = 0;
        document.querySelectorAll('.garden-crop-value').forEach(input => {
            usedValue += parseFloat(input.value) || 0;
        });

        if (isPercentMode) {
            const remainingPercent = 100 - usedValue;
            remainingLandText.textContent = `Remaining: ${remainingPercent.toFixed(1)}%`;
            remainingLandText.classList.toggle('text-red-500', remainingPercent < 0);
            remainingLandText.classList.toggle('text-amber-400', remainingPercent >= 0);
        } else {
            const remainingArea = totalArea - usedValue;
            remainingLandText.textContent = `Remaining: ${remainingArea.toFixed(1)} sq ft`;
            remainingLandText.classList.toggle('text-red-500', remainingArea < 0);
            remainingLandText.classList.toggle('text-amber-400', remainingArea >= 0);
        }
    }

    if (gardenPlannerForm) {
        allocModeToggle.addEventListener('change', () => {
            const isPercentMode = allocModeToggle.checked;
            document.getElementById('alloc-mode-label').textContent = isPercentMode ? 'Percentage (%)' : 'Area (sq ft)';
            document.querySelectorAll('.value-unit').forEach(span => span.textContent = isPercentMode ? '%' : 'sq ft');
            updateRemainingLand();
        });
        gardenPlannerForm.addEventListener('input', updateRemainingLand);
        addGardenCropBtn.addEventListener('click', createGardenCropInput);

        gardenPlannerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            layoutContainer.classList.add('hidden');
            gardenLoader.classList.remove('hidden');

            setTimeout(() => {
                gardenLoader.classList.add('hidden');
                layoutContainer.classList.remove('hidden');
                layoutContainer.classList.remove('initial-view');
                layoutContainer.classList.add('results-view');

                const totalArea = parseFloat(document.getElementById('garden-land-area').value) || 0;
                if (totalArea <= 0) {
                    alert("Please enter a total land area.");
                    showPage('gardening');
                    return;
                }

                const crops = [];
                let totalUsed = 0;

                document.querySelectorAll('#garden-crop-inputs > div').forEach(row => {
                    const key = row.querySelector('.garden-crop-select').value;
                    const value = parseFloat(row.querySelector('.garden-crop-value').value) || 0;
                    if (value <= 0) return;

                    const area = allocModeToggle.checked ? (totalArea * value) / 100 : value;
                    totalUsed += area;
                    crops.push({ key, area, data: gardenCropDetails[key] });
                });

                let totalValueCheck = allocModeToggle.checked ? (totalUsed / totalArea) * 100 : totalUsed;
                if (allocModeToggle.checked && totalValueCheck > 100.1) {
                    alert("Total percentage cannot exceed 100%.");
                    showPage('gardening');
                    return;
                }
                if (!allocModeToggle.checked && totalUsed > totalArea) {
                    alert("Total allocated area cannot exceed the total land area.");
                    showPage('gardening');
                    return;
                }

                gardenPlanResults.classList.remove('hidden');

                const summaryEl = document.getElementById('garden-input-summary');
                let summaryHTML = `<strong>Total Area:</strong> ${totalArea} sq ft | `;
                crops.forEach(c => {
                    summaryHTML += `<strong>${c.data.name}:</strong> ${c.area.toFixed(1)} sq ft (${((c.area / totalArea) * 100).toFixed(0)}%) | `;
                });
                const unusedLand = totalArea - totalUsed;
                if (unusedLand > 0.1) summaryHTML += `<strong>Unused:</strong> ${unusedLand.toFixed(1)} sq ft`;
                summaryEl.innerHTML = summaryHTML;

                const plotEl = document.getElementById('garden-plot-container');
                plotEl.innerHTML = '';

                const plotGrid = [];
                crops.forEach(crop => {
                    const numCells = Math.round((crop.area / totalArea) * 100);
                    for (let i = 0; i < numCells; i++) {
                        if (plotGrid.length < 100) {
                            plotGrid.push(crop);
                        }
                    }
                });

                while (plotGrid.length < 100) {
                    plotGrid.push(null);
                }

                plotGrid.forEach(item => {
                    const cellDiv = document.createElement('div');
                    if (item) {
                        cellDiv.className = 'plot-cell';
                        cellDiv.style.backgroundColor = item.data.color;
                        cellDiv.innerHTML = `<span>${item.data.icon}</span>`;
                        cellDiv.title = `${item.data.name}`;
                    } else {
                        cellDiv.className = 'plot-cell plot-cell-unused';
                        cellDiv.title = 'Unused Land';
                    }
                    plotEl.appendChild(cellDiv);
                });

                const infoEl = document.getElementById('garden-key-info');
                let totalWater = 0,
                    totalProfit = 0;
                let growingDays = new Set();
                let pesticides = new Set();
                crops.forEach(c => {
                    totalWater += c.area * c.data.water;
                    totalProfit += c.area * c.data.profit;
                    growingDays.add(`${c.data.name}: ${c.data.days} days`);
                    pesticides.add(c.data.pest);
                });
                infoEl.innerHTML = `
                    <p><strong>💧 Water Needed:</strong> ~${totalWater.toFixed(1)} gallons/week</p>
                    <p><strong>📅 Growing Days:</strong> ${Array.from(growingDays).join(', ')}</p>
                    <p><strong>🐛 Pesticides:</strong> ${Array.from(pesticides).join(', ')}</p>
                    <p><strong>💰 Est. Profit:</strong> ₹${totalProfit.toFixed(2)} per season</p>
                    <p><strong>🏞️ Unused Land:</strong> ${unusedLand.toFixed(1)} sq ft</p>
                `;
            }, 1500);
        });
    }

    // --- Authentication & Recommendation Page Logic ---
    // This section is now handled by the backend connection code below
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');
    const loginContainer = document.getElementById('login-form-container');
    const signupContainer = document.getElementById('signup-form-container');
    const userInfo = document.getElementById('user-info');
    const userNameEl = document.getElementById('user-name');
    const loginNavLink = document.getElementById('login-nav-link');
    const mobileAuthLinks = document.getElementById('mobile-auth-links');

    function updateNavbar() {
        if (isLoggedIn) {
            loginNavLink.classList.add('hidden');
            userInfo.classList.remove('hidden');
            userInfo.classList.add('flex');
            userNameEl.textContent = `Hi, ${currentUser.firstName}`;
            mobileAuthLinks.innerHTML = `<a onclick="logout()" class="block py-2 font-semibold text-red-600">Logout</a>`;
        } else {
            loginNavLink.classList.remove('hidden');
            userInfo.classList.add('hidden');
            userInfo.classList.remove('flex');
            mobileAuthLinks.innerHTML = `<a onclick="showPage('recommendation')" class="block py-2 nav-link">Get Recommendation</a>`;
        }
    }

    window.logout = function() {
        isLoggedIn = false;
        currentUser = null;
        updateNavbar();
        showPage('home');
    }

    if (showSignupBtn && showLoginBtn) {
        showSignupBtn.addEventListener('click', (e) => { e.preventDefault(); loginContainer.classList.add('hidden'); signupContainer.classList.remove('hidden'); });
        showLoginBtn.addEventListener('click', (e) => { e.preventDefault(); signupContainer.classList.add('hidden'); loginContainer.classList.remove('hidden'); });
    }

    const recommendationForm = document.getElementById('recommendation-form');
    const recommendationResult = document.getElementById('recommendation-result');
    const recommendationData = {
        potato: { images: ['https://images.unsplash.com/photo-1590165482096-7d033f9933d8?q=80&w=1974&auto=format&fit=crop'], desc: 'A versatile tuber that grows well in cooler climates with moderate rainfall. Prefers well-drained loamy soil.', idealTemp: [15, 20], idealSoil: ['loamy', 'sandy'] },
        tomato: { images: ['https://images.unsplash.com/photo-1607305387299-a3d961cf3462?q=80&w=1974&auto=format&fit=crop'], desc: 'Thrives in warm and sunny conditions. Requires consistent moisture and well-drained, nutrient-rich loamy soil.', idealTemp: [21, 27], idealSoil: ['loamy', 'black'] },
        cauliflower: { images: ['https://images.unsplash.com/photo-1588669934341-66795da73929?q=80&w=1974&auto=format&fit=crop'], desc: 'A cool-weather vegetable that prefers fertile, well-drained soil. Ideal for the Rabi season.', idealTemp: [15, 20], idealSoil: ['loamy', 'clay'] },
        lettuce: { images: ['https://images.unsplash.com/photo-1550482329-8ea504a50b9b?q=80&w=1974&auto=format&fit=crop'], desc: 'A cool-weather crop that grows quickly. It prefers loamy soil and consistent moisture.', idealTemp: [15, 21], idealSoil: ['loamy', 'clay'] },
        onion: { images: ['https://images.unsplash.com/photo-1587334207436-d86728203738?q=80&w=1974&auto=format&fit=crop'], desc: 'Prefers sunny locations and well-drained soil. Onions need plenty of nutrients to form large bulbs.', idealTemp: [20, 25], idealSoil: ['sandy', 'loamy'] },
    };

    if (recommendationForm) {
        recommendationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const temp = parseFloat(document.getElementById('rec-temp').value);
            const soil = document.getElementById('rec-soil').value;
            if (isNaN(temp)) { alert("Please enter a valid temperature."); return; }

            let scores = {};
            for (const crop in recommendationData) {
                scores[crop] = 0;
                const data = recommendationData[crop];
                if (temp >= data.idealTemp[0] && temp <= data.idealTemp[1]) {
                    scores[crop] += 2;
                } else if (Math.abs(temp - (data.idealTemp[0] + data.idealTemp[1]) / 2) < 5) {
                    scores[crop] += 1;
                }
                if (data.idealSoil.includes(soil)) {
                    scores[crop] += 2;
                }
            }

            let bestCrop = 'tomato';
            let maxScore = -1;
            for (const crop in scores) {
                if (scores[crop] > maxScore) {
                    maxScore = scores[crop];
                    bestCrop = crop;
                }
            }

            const data = recommendationData[bestCrop];
            const cropName = bestCrop.charAt(0).toUpperCase() + bestCrop.slice(1);
            const sliderImages = data.images.map((img, index) => `<div class="rec-slider-item absolute w-full h-full ${index === 0 ? 'opacity-100' : 'opacity-0'}"><img src="${img}" class="w-full h-full object-cover"></div>`).join('');

            recommendationResult.innerHTML = `
                <p class="font-semibold text-green-600">Our AI Recommends:</p>
                <h3 class="text-6xl font-extrabold my-4 text-gray-800">${cropName}</h3>
                <div class="relative h-80 rounded-xl overflow-hidden shadow-2xl my-6">
                    ${sliderImages}
                    <button id="rec-prev" class="absolute top-1/2 left-3 -translate-y-1/2 bg-white/60 hover:bg-white p-2 rounded-full z-10 transition"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
                    <button id="rec-next" class="absolute top-1/2 right-3 -translate-y-1/2 bg-white/60 hover:bg-white p-2 rounded-full z-10 transition"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
                </div>
                <p class="text-gray-600 mt-4 max-w-lg mx-auto">${data.desc}</p>
                <button id="learn-more-btn" data-crop="${bestCrop}" class="mt-6 btn-primary">Learn More About ${cropName}</button>
            `;
            recommendationResult.classList.remove('hidden');

            // Attach event listeners for the new slider and button
            let currentRecSlide = 0;
            const recSlides = recommendationResult.querySelectorAll('.rec-slider-item');
            const showRecSlide = (index) => { recSlides.forEach((s, i) => { s.classList.toggle('opacity-100', i === index); s.classList.toggle('opacity-0', i !== index); }); };
            recommendationResult.querySelector('#rec-next').addEventListener('click', () => { currentRecSlide = (currentRecSlide + 1) % recSlides.length; showRecSlide(currentRecSlide); });
            recommendationResult.querySelector('#rec-prev').addEventListener('click', () => { currentRecSlide = (currentRecSlide - 1 + recSlides.length) % recSlides.length; showRecSlide(currentRecSlide); });
            recommendationResult.querySelector('#learn-more-btn').addEventListener('click', (e) => {
                const cropKey = e.target.dataset.crop;
                showPage('crop-study');
                setTimeout(() => {
                    document.getElementById('crop-selector').value = cropKey;
                    displayCropInfo(cropKey);
                }, 100);
            });
        });
    }

    // --- Automation Charts Logic ---
    function createAutomationCharts() {
        const nutrientChartCanvas = document.getElementById('nutrientChart');
        const environmentChartCanvas = document.getElementById('environmentChart');

        if (nutrientChartCanvas && environmentChartCanvas) {
            // Destroy existing charts to prevent memory leaks and rendering issues
            if (Chart.getChart(nutrientChartCanvas)) { Chart.getChart(nutrientChartCanvas).destroy(); }
            if (Chart.getChart(environmentChartCanvas)) { Chart.getChart(environmentChartCanvas).destroy(); }

            new Chart(nutrientChartCanvas.getContext('2d'), {
                type: 'doughnut',
                data: { labels: ['Nutrient A', 'Nutrient B', 'Water'], datasets: [{ data: [30, 20, 50], backgroundColor: ['#34d399', '#60a5fa', '#3b82f6'] }] },
                options: { responsive: true, plugins: { legend: { position: 'top' } } }
            });

            new Chart(environmentChartCanvas.getContext('2d'), {
                type: 'bar',
                data: { labels: ['Temp (°C)', 'Humidity (%)'], datasets: [{ label: 'Live Reading', data: [24, 65], backgroundColor: ['#fb923c', '#60a5fa'], maxBarThickness: 50 }] },
                options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
            });

            document.getElementById('light-intensity').addEventListener('input', (e) => { document.getElementById('light-value').innerText = `${e.target.value}%`; });
        }
    }

    // --- Initial Load ---
    updateNavbar();
    showPage('home');
    if (gardenPlannerForm) {
        createGardenCropInput();
    }



    // ===================== BACKEND CONNECTION =====================

    // Change this if your backend runs elsewhere
    const BASE_URL = "http://127.0.0.1:8000";

    // -------- SIGNUP --------
    document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const userData = {
            firstName: document.getElementById("first-name").value,
            lastName: document.getElementById("last-name").value,
            email: document.getElementById("signup-email").value,
            password: document.getElementById("signup-password").value,
        };

        try {
            const res = await fetch(`${BASE_URL}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const data = await res.json();
            alert(data.message || "Signup successful!");

            if (data.status === "success") {
                // Auto-login after signup
                currentUser = { firstName: userData.firstName };
                isLoggedIn = true;
                updateNavbar();
                showPage("recommendation");
            }
        } catch (err) {
            alert("Error connecting to backend");
            console.error(err);
        }
    });

    // -------- LOGIN --------
    document.getElementById("login-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const loginData = {
            email: document.getElementById("login-email").value,
            password: document.getElementById("login-password").value,
        };

        try {
            const res = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });

            const data = await res.json();
            alert(data.message || "Login successful!");

            if (data.status === "success") {
                currentUser = { firstName: loginData.email.split("@")[0] };
                isLoggedIn = true;
                updateNavbar();
                showPage("recommendation");
            }
        } catch (err) {
            alert("Error connecting to backend");
            console.error(err);
        }
    });
});
