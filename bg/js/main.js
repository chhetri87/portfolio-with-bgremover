document.addEventListener('DOMContentLoaded', () => {
    // Optimize sample images loading
    const sampleImages = document.querySelectorAll('.sample-item img');
    sampleImages.forEach(img => {
        if ('loading' in HTMLImageElement.prototype) {
            img.loading = 'lazy';
        }
        img.decoding = 'async';
    });

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const progressBar = document.getElementById('progressBar');
    const progress = progressBar.querySelector('.progress');
    const imageComparison = document.getElementById('imageComparison');
    const originalImage = document.getElementById('originalImage');
    const processedImage = document.getElementById('processedImage');
    const downloadBtn = document.getElementById('downloadBtn');

    // Drag and drop functionality
    dropZone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!dropZone.classList.contains('drag-over')) {
            dropZone.classList.add('drag-over');
        }
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) {
            processImage(file);
        }
    });

    // Upload button functionality
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            processImage(file);
        }
    });

    // Image comparison slider functionality
    let isSliding = false;
    const slider = document.querySelector('.slider-handle');

    slider.addEventListener('mousedown', startSliding);
    document.addEventListener('mousemove', slide);
    document.addEventListener('mouseup', stopSliding);

    // Touch events for mobile
    slider.addEventListener('touchstart', startSliding);
    document.addEventListener('touchmove', slide);
    document.addEventListener('touchend', stopSliding);

    function startSliding(e) {
        isSliding = true;
        e.preventDefault();
    }

    function stopSliding() {
        isSliding = false;
    }

    function slide(e) {
        if (!isSliding) return;

        const sliderRect = document.querySelector('.comparison-slider').getBoundingClientRect();
        const x = (e.type === 'mousemove' ? e.clientX : e.touches[0].clientX) - sliderRect.left;
        const percent = Math.min(Math.max(x / sliderRect.width * 100, 0), 100);

        slider.style.left = `${percent}%`;
        processedImage.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    }

    // Process image function with API integration
    async function processImage(file) {
        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Please upload an image file (JPG, PNG, etc)');
            }

            // Validate file size
            if (file.size > CONFIG.MAX_FILE_SIZE) {
                throw new Error('File size too large. Please upload an image smaller than 5MB');
            }

            // Show progress bar
            progressBar.style.display = 'block';
            progress.style.width = '0%';
            
            // Create object URL for original image
            const objectUrl = URL.createObjectURL(file);
            originalImage.src = objectUrl;

            // Prepare form data for API
            const formData = new FormData();
            formData.append('image_file', file);
            formData.append('size', 'auto');

            // Update progress to show upload started
            progress.style.width = '20%';

            try {
                // Make API request
                const response = await fetch(CONFIG.API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'X-Api-Key': CONFIG.API_KEY,
                    },
                    body: formData
                });

                // Update progress to show processing
                progress.style.width = '60%';

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `API Error: ${response.status}`);
                }

                // Get the processed image blob
                const blob = await response.blob();
                const processedImageUrl = URL.createObjectURL(blob);
                
                // Update progress to show completion
                progress.style.width = '100%';

                // Display the processed image
                processedImage.src = processedImageUrl;
                imageComparison.style.display = 'block';
                
                // Hide progress bar after a short delay
                setTimeout(() => {
                    progressBar.style.display = 'none';
                }, 500);

            } catch (apiError) {
                console.error('API Error:', apiError);
                if (apiError.message.includes('402')) {
                    alert('API credit exhausted. Please check your API key.');
                } else {
                    alert(`Error processing image: ${apiError.message}`);
                }
                progressBar.style.display = 'none';
            }

        } catch (error) {
            console.error('Error processing image:', error);
            alert(error.message || 'Error processing image. Please try again.');
            progressBar.style.display = 'none';
        }
    }

    // Update download functionality to always save as PNG
    downloadBtn.addEventListener('click', () => {
        const timestamp = new Date().getTime();
        const brandedFileName = `DipErase_${timestamp}.png`;

        // Create a canvas to convert the image to PNG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Convert to PNG and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = brandedFileName;
                link.href = url;
                link.click();
                
                // Clean up
                URL.revokeObjectURL(url);
            }, 'image/png');
        };
        
        img.src = processedImage.src;
    });

    // Navigation functionality
    const navLinks = document.querySelectorAll('.main-nav a');
    const sections = document.querySelectorAll('.page-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show/hide sections
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });

            // Show/hide home content
            const homeContent = document.querySelector('#home');
            if (targetId === 'home') {
                homeContent.style.display = 'block';
            } else {
                homeContent.style.display = 'none';
            }
        });
    });

    // Sample images functionality
    document.querySelectorAll('.try-sample').forEach(button => {
        button.addEventListener('click', async () => {
            const sampleId = button.dataset.sample;
            const sampleImg = button.parentElement.querySelector('.original');
            
            // Disable button while processing
            button.disabled = true;
            button.textContent = 'Processing...';
            
            try {
                // Convert sample image to file
                const response = await fetch(sampleImg.src);
                const blob = await response.blob();
                const file = new File([blob], `${sampleId}.jpg`, { type: 'image/jpeg' });
                
                // Process the sample image
                await processImage(file);
                
                // Switch to home section and scroll
                document.querySelector('.main-nav a[href="#home"]').click();
                document.querySelector('.image-comparison').scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                console.error('Error processing sample:', error);
            } finally {
                // Re-enable button
                button.disabled = false;
                button.textContent = 'Try with this image';
            }
        });
    });

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Add your contact form handling logic here
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
}); 