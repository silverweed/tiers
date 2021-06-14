'use strict';

/*
function extract_filename(path) {
	if (path.substr(0, 12) === "C:\\fakepath\\")
		return path.substr(12); // modern browser
	var x;
	x = path.lastIndexOf('/');
	if (x >= 0) // Unix-based path
		return path.substr(x+1);
	x = path.lastIndexOf('\\');
	if (x >= 0) // Windows-based path
		return path.substr(x+1);
	return path; // just the filename
}

document.getElementById('load-img-input').addEventListener('input', (evt) => {
	console.log(extract_filename(evt.target.value));
});
*/

let dragged_image;

window.addEventListener('load', () => {
	let fragment = new DocumentFragment();
	for (let img_name of IMAGES) {
		let img = document.createElement('img');
		img.src = img_name;
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
});

function end_drag(evt) {
	dragged_image?.classList.remove("dragged");
	dragged_image = null;
}

window.addEventListener('mouseup', end_drag);
window.addEventListener('dragend', end_drag);

function make_accept_drop(elem) {
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
		if (dragged_image) {
			evt.preventDefault();
			dragged_image.parentNode.removeChild(dragged_image);
			event.target.appendChild(dragged_image);
			evt.target.classList.remove('drag-entered');
		}
	});
}

document.querySelectorAll('.tierlist tr').forEach(make_accept_drop);
make_accept_drop(document.querySelector('.images'));
