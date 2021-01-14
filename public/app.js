const ws = new WebSocket('ws://localhost:8000/ws');

const nameForm = () => document.querySelector('.name-form');
const chatForm = () => document.querySelector('.chat-form');
const chatList = () => document.querySelector('.chat-list');
const chatRoom = () => document.querySelector('.chatroom');
const lobby = () => document.querySelector('.lobby');
const leaveBtn = () => document.querySelector('.leaveBtn');
let name = 'anonymous';
let roomname = null;

const nameFormHandler = (evt) => {
  evt.preventDefault();
  name = nameForm().nickname.value;
  nameForm().nickname.value = '';
  nameForm().classList.add('hidden');
  lobby().classList.remove('hidden');
};

const btnHandler = (evt) => {
  if (evt.target.tagName !== 'BUTTON') { return; }
  roomname = evt.target.textContent;
  lobby().classList.add('hidden');
  chatRoom().classList.remove('hidden');
  ws.send(
    JSON.stringify({
      action: 'onjoin',
      payload: { username: name, roomname, msg: 'has join the room' },
    })
  );
};

const leaveRoomHandler = () => {
  chatRoom().classList.add('hidden');
  lobby().classList.remove('hidden');
  ws.send(
    JSON.stringify({
      action: 'onleave',
      payload: { username: name, roomname, msg: 'left the room.'}
    })
  )
}

const chatFormHandler = (evt) => {
  evt.preventDefault();
  let msg = chatForm().msg.value;
  ws.send(
    JSON.stringify({
      action: 'msg',
      payload: { username: name, roomname, msg },
    })
  );
};

const outputMsg = ({ data }) => {
  const { username, msg } = JSON.parse(data);
  const temp = `
  <li>
      <div class="name">${username}</div>
      <div class="msg">${msg}</div>
    </li>`;
  chatList().innerHTML += temp;
};

ws.addEventListener('message', outputMsg);
document.addEventListener('DOMContentLoaded', () => {
  nameForm().addEventListener('submit', nameFormHandler);
  lobby().addEventListener('click', btnHandler);
  chatForm().addEventListener('submit', chatFormHandler);
  leaveBtn().addEventListener('click', leaveRoomHandler);
});