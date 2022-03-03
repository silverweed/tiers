/*
	Offline Tierlist Maker
	Copyright (C) 2021  silverweed

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, version 3 of the License.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

'use strict';

// Use to serialize the tier list
let tierlist = {};

let dragged_image;

function load_images() {
	let fragment = new DocumentFragment();
	for (let img_name of IMAGES) {
		let img = document.createElement('img');
		img.src = img_name;
		img.style.userSelect = 'none';
		img.classList.add('draggable');
		img.draggable = true;
		img.addEventListener('mousedown', (evt) => {
			dragged_image = evt.target;
			dragged_image.classList.add("dragged");
		});
		fragment.appendChild(img);
	}

	let images = document.querySelector('.images');
	images.appendChild(fragment);
}

function reset_list(clear_images = false) {
	document.querySelectorAll('.tierlist span.item').forEach((item) => {
		let images = document.querySelector('.images');
		for (let i = 0; i < item.children.length; ++i) {
			let img = item.children[i];
			item.removeChild(img);
			if (!clear_images) {
				images.appendChild(img);
			}
		}
		item.parentNode.removeChild(item);
	});
	tierlist = {};
}

window.addEventListener('load', () => {
	document.querySelectorAll('.tierlist div.row').forEach(make_accept_drop);
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

	document.querySelector('.title').addEventListener('click', (evt) => {
		title_label.style.display = 'none';
		title_input.value = title_label.innerText;
		title_input.style.display = 'inline';
		title_input.select();
	});

	document.getElementById('load-img-input').addEventListener('input', (evt) => {
		// @Speed: maybe we can do some async stuff to optimize this
		let images = document.querySelector('.images');
		for (let file of evt.target.files) {
			let reader = new FileReader();
			reader.addEventListener('load', (load_evt) => {
				let img = create_img_with_src(load_evt.target.result);
				images.appendChild(img);
			});
			reader.readAsDataURL(file);
		}
	});

	document.getElementById('reset-list-input').addEventListener('click', () => {
		if (confirm('Reset Tierlist? (this will place all images back in the pool)')) {
			reset_list();
		}
	});

	document.getElementById('export-input').addEventListener('click', () => {
		let name = prompt('Please give a name to this tierlist');
		if (name) {
			save_tierlist(`${name}.json`);
		}
	});

	document.getElementById('import-input').addEventListener('input', (evt) => {
		if (!evt.target.files) {
			return;
		}
		let file = evt.target.files[0];
		let reader = new FileReader();
		reader.addEventListener('load', (load_evt) => {
			let raw = load_evt.target.result;
			let parsed = JSON.parse(raw);
			if (!parsed) {
				alert("Failed to parse data");
				return;
			}
			reset_list(true);
			load_tierlist(parsed);
		});
		reader.readAsText(file);
	});
});

function create_img_with_src(src) {
	let img = document.createElement('img');
	img.src = src;
	img.style.userSelect = 'none';
	img.classList.add('draggable');
	img.draggable = true;
	img.ondragstart = "event.dataTransfer.setData('text/plain', null)";
	img.addEventListener('mousedown', (evt) => {
		dragged_image = evt.target;
		dragged_image.classList.add("dragged");
	});
	return img;
}

function save(filename, text) {
	var el = document.createElement('a');
	el.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(text));
	el.setAttribute('download', filename);
	el.style.display = 'none';
	document.body.appendChild(el);
	el.click();
	document.body.removeChild(el);
}

function save_tierlist(filename) {
	let serialized_tierlist = {};
	for (let key in tierlist) {
		let imgs = tierlist[key];
		serialized_tierlist[key] = imgs.map(img => img.src);
	}
	serialized_tierlist.title = document.querySelector('.title-label').innerText;
	save(filename, JSON.stringify(serialized_tierlist));
}

function load_tierlist(serialized_tierlist) {
	document.querySelector('.title-label').innerText = serialized_tierlist.title;
	for (let key in serialized_tierlist) {
		if (!TIERS.includes(key)) {
			continue;
		}

		for (let img_src of serialized_tierlist[key]) {
			let img = create_img_with_src(img_src);
			let tier = document.querySelector(`.tierlist div.row.${key}`);
			if (tier) {
				let td = document.createElement('span');
				td.classList.add('item');
				td.appendChild(img);
				let items_container = tier.querySelector('.items');
				items_container.appendChild(td);
				if (!tierlist[key]) {
					tierlist[key] = [];
				}
				tierlist[key].push(img);
			}
		}
	}
}

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

		if (!dragged_image) {
			return;
		}

		let dragged_image_parent = dragged_image.parentNode;
		if (dragged_image_parent.tagName.toUpperCase() === 'SPAN' && dragged_image_parent.classList.contains('item')) {
			// We were already in a tier
			let containing_tr = dragged_image_parent.parentNode;
			containing_tr.removeChild(dragged_image_parent);

			let tier_name = retrieve_tier_name(containing_tr);
			if (tierlist[tier_name]) {
				let removed_idx = tierlist[tier_name].indexOf(dragged_image);
				if (removed_idx >= 0) {
					tierlist[tier_name].splice(removed_idx, 1);
				}
			}
		} else {
			dragged_image_parent.removeChild(dragged_image);
		}
		let td = document.createElement('span');
		td.classList.add('item');
		td.appendChild(dragged_image);
		let items_container = elem.querySelector('.items');
		items_container.appendChild(td);

		let tier_name = retrieve_tier_name(elem);
		if (tier_name) {
			if (!tierlist[tier_name]) {
				tierlist[tier_name] = [];
			}
			tierlist[tier_name].push(dragged_image);
		}
	});
}

const TIERS = ['s','a','b','c','d','e','f'];

function retrieve_tier_name(item) {
	for (let clsname of item.classList) {
		if (TIERS.includes(clsname)) {
			return clsname;
		}
	}
	return null;
}
