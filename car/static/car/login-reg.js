// Toggle passwords
const style = document.createElement('style')

const pwDiv = document.getElementById('div_id_password')
const pwOneDiv = document.getElementById('div_id_password1')
const pwTwoDiv = document.getElementById('div_id_password2')
const viewPwIcon = document.createElement('i')
const viewPwTwoIcon = document.createElement('i')
if(pwDiv){
    viewPwIcon.classList.add('far', 'fa-eye')
    pwDiv.insertBefore(viewPwIcon, pwDiv.firstElementChild.nextSibling)
    let pwInput = viewPwIcon.nextElementSibling.firstElementChild;
    viewPwIcon.addEventListener('click', ()=>{
        togglePassword(pwInput, viewPwIcon)
    })


} else{
    viewPwIcon.classList.add('far', 'fa-eye')
    viewPwTwoIcon.classList.add('far', 'fa-eye')
    pwOneDiv.insertBefore(viewPwIcon, pwOneDiv.firstElementChild.nextSibling)
    pwTwoDiv.insertBefore(viewPwTwoIcon, pwTwoDiv.firstElementChild.nextSibling)
    let pwOne = viewPwIcon.nextElementSibling.firstElementChild;
    let pwTwo = viewPwTwoIcon.nextElementSibling.firstElementChild;
    viewPwIcon.addEventListener('click', ()=>{
        togglePassword(pwOne, viewPwIcon)
    })
    viewPwTwoIcon.addEventListener('click', ()=>{
        togglePassword(pwTwo, viewPwTwoIcon)
    })
}

style.innerHTML = `
    .fa-eye {
        float: right;
        margin-top: 8px;
        cursor: pointer;
    }
`
document.head.appendChild(style)

function togglePassword(pwInput, icon){
    const inputType = pwInput.getAttribute('type') === 'password' ? 'text' : 'password';
    pwInput.setAttribute('type', inputType)
    icon.classList.toggle('fa-eye-slash')
}