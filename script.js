//document.addEventListener('DOMContentLoaded',
(function() {
	var scripts_src = 'http://localhost/';
	var my_name = 'yasla';
	var userblock = document.querySelector && document.querySelector('div.user-block');
	var username = userblock && document.querySelector && userblock.querySelector('span.user-name');
	var dt = new Date();
	var is_now = dt.getMonth() == 3 && dt.getDate() == 1;
	if (username && username.textContent == my_name)
	{
		// ok
	}
	else if (!username || !is_now)
	{
		return;
	}
	if (window.console) console.log('init');
	var username_first = username.textContent.replace(/\s.+/, '');
	var speech = null;
	
	// FIXME в ff не работает
	if (window.SpeechSynthesisUtterance && window.speechSynthesis)
	{
		speech = new window.SpeechSynthesisUtterance();
		speech.lang = 'ru-RU'; //'en-US';
		speech.rate = 1.5;
		speech.pitch = 2;
		speech.volume = 1;
	}

	var speak = function(str){
		if (!speech) return;
		if (speechSynthesis.speaking) return;
		speech.text = str;
		speechSynthesis.speak(speech);
	};
	
	var cites = [
	             'Я слежу за тобой, ' + username_first + '!',
	             username_first + ', поговори со мной... Мне тут скучно.',
	             'Работай, ' + username_first + ' - солнце ещё высоко!',
	             username_first + ', скажи "Бе-бе"... Ну пожалуйста!',
	             username_first + ', ты олень!',
	             username_first + ', закрой вконтактик!',
	             'Пыщ-пыщ! О-ло-ло!',
	             'Ну всё, я спряталась. Ищи меня, ' + username_first + '.',
	             'Кто понял жизнь, тот не спешиит. Куда тороопишься, ' + username_first + '?',
	             'Ой, хочу чаю.',
	             'Что-то поработать хочется. Пойду полежу, может пройдёт.',
	             username_first + ', а что это за весёленькая музычка у тебя играет?',
	             'Привет, ' + username_first + '! Я демон браузера! Ууууууууууу! Загадывай одно желание, раз вызвал меня!',
	             'Эх, ' + username_first + '-' + username_first + '. С днём дуралея тебя!'
	             ];
	var speaker = function(){
		speak(cites[Math.floor(Math.random() * cites.length)]);
		window.setTimeout(speaker, 1000 * 60 * Math.round(Math.random() * 25 + 5));
	};
	window.setTimeout(speaker, 1000 * 60 * 5);
	//speak(cites[cites.length - 1]);
	
	var canvas_id = 'box2dcanvas';
	var box2dcanvas = document.createElement('canvas');
	box2dcanvas.id = canvas_id;
	box2dcanvas.width = 1;
	box2dcanvas.height = 1;
	box2dcanvas.style.position = 'absolute';
	document.body.insertBefore(box2dcanvas, document.body.children[0]);
	var box2d_scripts = ['Box2dWeb-2.1.a.3.min.js', 'RequestAnimationFrame.js', 'MouseAndTouch.js', 'box2d.js'];
	var box2d_count = 0;
	box2d_scripts.forEach(function(js_name){
		var _pg = document.createElement('script');
		_pg.type ='text/javascript';
		_pg.async = true;
		_pg.src = scripts_src + js_name;
		var _sc = document.getElementsByTagName('script')[0];
		_sc.parentNode.insertBefore(_pg, _sc);
		_pg.onload = function () {
			box2d_count++;
			if (box2d_count == box2d_scripts.length)
			{
				var cl = function(){
					var btn = document.querySelector('.tm-popup-button-handler');
					// webform-button-accept - webform-button-decline
					if (btn && !btn.querySelector('.webform-button-decline'))
					{
						btn.addEventListener('click', cl2);
					}
					document.getElementById('timeman-block').removeEventListener('click', cl);
				};
				var cl2 = function(){
					var box2d = new box2dprofi();
					var sel = '#timeman_main';
					box2d.init(sel, canvas_id);
					window.setTimeout(function(){speak("Эй, " + username_first + ", точно руки из жоопы! Обнови страницу и больше не трогай ничего!");}, 1000);
					document.querySelector('.tm-popup-button-handler').removeEventListener('click', cl2);
				};
				document.getElementById('timeman-block').addEventListener('click', cl);
			}
		};
	});
})();
//);
