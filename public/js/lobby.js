const socket = io('ws://localhost:3000');

socket.on('connect', () => {
    console.log('connected')
})

var shipId = 'lobby-id-' + makeid(24);

console.log(shipId);

$(document).ready(function() {
    $('#usermane-input').focus();
});

$('#username-input').keypress(function(event){
    if(event.keyCode === 13){
        $('#start-button').click();
    }
});

$('#start-button').on('click', () => {
    var username = $('#username-input').val();
    if(!username.length <= 15 && !username.length > 0) {return}
    socket.emit('player-join', {username: username, shipId: shipId});
})

socket.on('player-joined', () => {
    sessionStorage.setItem('shipId', shipId);
    window.location.href = '/game.html';
});

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}