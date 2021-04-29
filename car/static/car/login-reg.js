// Toggle passwords
const style = document.createElement('style')

const pwInput = document.getElementById('id_password')
const pwInput1 = document.getElementById('id_password1')
const pwInput2 = document.getElementById('id_password2')

const viewPwIcon = document.createElement('i')
const viewPwTwoIcon = document.createElement('i')

if(pwInput){

    pwInputDiv = pwInput.parentNode
    pwInputDiv.className = 'pw-input-div'
    viewPwIcon.classList.add('far', 'fa-eye')
    pwInputDiv.appendChild(viewPwIcon)
    viewPwIcon.addEventListener('click', ()=>{
        togglePassword(pwInput, viewPwIcon)
    })
    console.log(pwInputDiv.firstChild)

} else{

    pwInputDiv1 = pwInput1.parentNode
    pwInputDiv1.className = 'pw-input-div1'
    pwInputDiv2 = pwInput2.parentNode
    pwInputDiv2.className = 'pw-input-div2'

    viewPwIcon.classList.add('far', 'fa-eye')
    viewPwTwoIcon.classList.add('far', 'fa-eye')
    
    pwInputDiv1.appendChild(viewPwIcon)
    pwInputDiv2.appendChild(viewPwTwoIcon)
    viewPwIcon.addEventListener('click', ()=>{
        togglePassword(pwInput1, viewPwIcon)
    })
    viewPwTwoIcon.addEventListener('click', ()=>{
        togglePassword(pwInput2, viewPwTwoIcon)
    })
}

style.innerHTML = `
    .fa-eye {
        position: absolute;
        top: 0.7rem;
        right: 0.8rem;
        cursor: pointer;
    }
    .pw-input-div, .pw-input-div1, .pw-input-div2 {
        position: relative;
    }
`
document.head.appendChild(style)

function togglePassword(pwInput, icon){
    const inputType = pwInput.getAttribute('type') === 'password' ? 'text' : 'password';
    pwInput.setAttribute('type', inputType)
    icon.classList.toggle('fa-eye-slash')
}