const ws = new WebSocket("ws://localhost:8000/ws");

const nameForm = document.querySelector('.name-form');
const chatForm = document.querySelector('.chat-form');
const chatList = document.querySelector('.chat-list');
const chatRoom = document.querySelector('.chatroom');
let name = 'anon';

nameForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  name = nameForm.nickname.value;
  nameForm.nickname.value = '';
  nameForm.classList.add('hidden');
  chatRoom.classList.remove('hidden');
})

chatForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  let msg = chatForm.msg.value;
  ws.send(JSON.stringify({ name, msg }));
})

const outputMsg = ({ data }) => {
  const { name, msg } = JSON.parse(data);
  const temp = `
  <li>
      <div class="name">${name}</div>
      <div class="msg">${msg}</div>
    </li>`
  chatList.innerHTML += temp;

}

ws.addEventListener('message', outputMsg)