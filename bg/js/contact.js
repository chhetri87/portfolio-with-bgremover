function showPopup(message, isSuccess = true) {
    // Create popup elements
    const popup = document.createElement('div');
    popup.className = `popup ${isSuccess ? 'success' : 'error'}`;
    
    const icon = document.createElement('i');
    icon.className = isSuccess ? 'fas fa-check-circle' : 'fas fa-times-circle';
    
    const messageText = document.createElement('p');
    messageText.textContent = message;
    
    // Assemble popup
    popup.appendChild(icon);
    popup.appendChild(messageText);
    document.body.appendChild(popup);
    
    // Animate in
    setTimeout(() => popup.classList.add('show'), 100);
    
    // Remove after delay
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}

function sendEmail(event) {
    event.preventDefault();

    // Determine which form was submitted
    const isFooterForm = event.target.id === 'footerContactForm';
    const formId = isFooterForm ? 'footer' : '';

    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    // Get form values
    const name = document.getElementById(formId + 'Name').value;
    const email = document.getElementById(formId + 'Email').value;
    const message = document.getElementById(formId + 'Message').value;

    // Basic validation
    if (!name || !email || !message) {
        showPopup('Please fill in all fields', false);
        return false;
    }
    
    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Prepare template parameters
    const templateParams = {
        from_name: name,
        from_email: email,
        message: message,
        to_name: 'DipErase Team', // Add recipient name
        reply_to: email
    };

    // Replace these with your actual EmailJS service and template IDs
    emailjs.send(
        'dipeshchettri38',        // Your service ID
        'template_ix9ppkb',       // Add your actual template ID here
        templateParams
    )
    .then(function() {
        // Show success popup
        showPopup('Message sent successfully! 🎉');
        
        // Reset form
        document.getElementById(formId + 'Form').reset();
    })
    .catch(function(error) {
        // Show error popup
        console.error('EmailJS Error:', error);
        showPopup('Failed to send message. Please try again.', false);
    })
    .finally(function() {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    });

    return false;
}

// Add event listener to form
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', sendEmail);
    }
}); 