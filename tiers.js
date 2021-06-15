'use strict';

document.getElementById('load-img-input').addEventListener('input', (evt) => {
	// @Speed: maybe we can do some async stuff to optimize this
	let images = document.querySelector('.images');
	for (let file of evt.target.files) {
		let reader = new FileReader();
		reader.addEventListener('load', (load_evt) => {
			let img = document.createElement('img');
			img.src = load_evt.target.result;
			img.style.userSelect = 'none';
			img.classList.add('draggable');
			img.draggable = true;
			img.ondragstart = "event.dataTransfer.setData('text/plain', null)";
			img.addEventListener('mousedown', (evt) => {
				dragged_image = evt.target;
				dragged_image.classList.add("dragged");
			});
			images.appendChild(img);
		});
		reader.readAsDataURL(file);
	}
});

let dragged_image;

function load_images() {
	let fragment = new DocumentFragment();
	for (let img_name of IMAGES) {
		let img = document.createElement('img');
		img.src = img_name;
		img.style.userSelect = 'none';
		img.classList.add('draggable');
		img.draggable = true;
		img.ondragstart = "event.dataTransfer.setData('text/plain', null)";
		img.addEventListener('mousedown', (evt) => {
			dragged_image = evt.target;
			dragged_image.classList.add("dragged");
		});
		fragment.appendChild(img);
	}

	let images = document.querySelector('.images');
	images.appendChild(fragment);
}

window.addEventListener('load', () => {
	//load_images();

	document.querySelectorAll('.tierlist tr').forEach(make_accept_drop);
	make_accept_drop(document.querySelector('.images'));

	let title_label = document.querySelector('.title-label');
	let title_input = document.getElementById('title-input');
	
	function change_title(evt) {
		title_input.style.display = 'none';
		title_label.innerText = title_input.value;
		title_label.style.display = 'inline';
	}

	title_input.addEventListener('change', change_title);
	title_input.addEventListener('focusout', change_title);

	title_label.addEventListener('click', (evt) => {
		evt.target.style.display = 'none';
		title_input.value = title_label.innerText;
		title_input.style.display = 'inline';
	});
});

function end_drag(evt) {
	dragged_image?.classList.remove("dragged");
	dragged_image = null;
}

window.addEventListener('mouseup', end_drag);
window.addEventListener('dragend', end_drag);

function make_accept_drop(elem) {
	elem.classList.add('droppable');

	elem.addEventListener('dragenter', (evt) => {
		evt.target.classList.add('drag-entered');
	});
	elem.addEventListener('dragleave', (evt) => {
		evt.target.classList.remove('drag-entered');
	});
	elem.addEventListener('dragover', (evt) => {
		evt.preventDefault();
	});
	elem.addEventListener('drop', (evt) => {
		evt.preventDefault();
		evt.target.classList.remove('drag-entered');
		if (dragged_image && evt.target.classList.contains('droppable')) {
			dragged_image.parentNode.removeChild(dragged_image);
			event.target.appendChild(dragged_image);
		}
	});
}
