const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.querySelector('.container');

signUpButton.addEventListener('click', () => {
    event.preventDefault();
    container.classList.add('right-panel-active');
});

signInButton.addEventListener('click', () => {
    event.preventDefault();
    container.classList.remove('right-panel-active');
});
