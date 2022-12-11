// YMars game engine
// made by yeti0904

"use strict";

export let YMars_tileSize = 16;

export function EngineUtil_ResizeArray(arr, newSize, defaultValue) {
	// https://stackoverflow.com/a/32054416/12577005

    var delta = arr.length - size;

    if (delta > 0) {
        arr.length = size;
    }
    else {
        while (delta++ < 0) {
			arr.push(defaultValue);
		}
    }

	return arr;
}

export function EngineUtil_Resize2DArray(arr, newSize, defaultValue) {
	while (arr.length > newSize.y) {
		arr.pop();
	}
	while (arr.length < newSize.y) {
		arr.push(defaultValue);
	}
	for (let i = 0; i < arr.length; ++i) {
		while (arr[i].length > newSize.x) {
			arr[i].pop();
		}
		while (arr[i].length < newSize.x) {
			arr[i].push(defaultValue);
		}
	}

	return arr;
}

export class Vec2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

export class Rect {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	Collides(other) {
		return (
			(this.x < other.x + other.w) &&
			(this.x + this.w > other.x) &&
			(this.y < other.y + other.h) &&
			(this.y + this.h > other.y)
		);
	}
}

export class TileDef {
	constructor(name, textureURL, visible, solid) {
		this.name       = name;
		this.textureURL = textureURL;
		this.visible    = visible;
		this.solid      = solid;
	}
}

export class TileDefs {
	constructor() {
		this.defs = {};
		this.AddDef(0, "Air", "", false, false);
	}
	AddDef(id, name, textureURL, visible, solid) {
		this.defs[id] = new TileDef(name, textureURL, visible, solid);
	}
}

export class Level {
	constructor(w, h) {
		this.tiles = EngineUtil_Resize2DArray([], new Vec2(w, h), 0);
	}
	Size() {
		return new Vec2(this.tiles[0].length, this.tiles.length);
	}
	ValidBlock(pos) {
		return (
			(pos.x >= 0) &&
			(pos.y >= 0) &&
			(pos.x < this.Size().x) &&
			(pos.y < this.Size().y)
		);
	}
}

export class Player {
	constructor(hitbox) {
		this.pos           = new Vec2(0, 0);
		this.hitbox        = hitbox;
		this.velocity      = new Vec2(0.0, 0.0);
		this.physicsFrozen = false;
	}
	DoPhysics(level) {
		if (this.physicsFrozen) {
			return;
		}

		this.pos.x += this.velocity.x;
		this.pos.y += this.velocity.y;

		this.velocity.y += 0.1;

		if (this.velocity.x > 0) {
			this.velocity.x -= 0.1;
		}
		if (this.velocity.x < 0) {
			this.velocity.x += 0.1;
		}
	}
}

export class Button {
	constructor(x, y, w, h, fill, outline, textColour, label, onclick) {
		this.box        = new Rect(x, y, w, h);
		this.label      = label;
		this.onclick    = onclick;
		this.fill       = fill;
		this.outline    = outline;
		this.textColour = textColour;
	}
	IsMouseOver(position) {
		return (
			(position.x >= this.box.x) &&
			(position.y >= this.box.y) &&
			(position.x < this.box.x + this.box.w) &&
			(position.y < this.box.y + this.box.h)
		);
	}
	Render(ctx) {
		// render box
		ctx.fillStyle = this.fill;
		ctx.fillRect(this.box.x, this.box.y, this.box.w, this.box.h);
		ctx.fillStyle = this.outline;
		ctx.rect(this.box.x, this.box.y, this.box.w, this.box.h);

		// render text
		let size = ctx.measureText(this.label);
		let pos  = new Vec2(
			(this.box.w / 2) - (size.width / 2),
			(this.box.h / 2)
		);
		ctx.fillStyle = this.textColour;
		ctx.fillText(this.label, this.box.x + pos.x, this.box.y + pos.y);
	}
}

export class Scene {
	constructor() {
		this.player = null;
		this.level  = null;
		this.bg     = "#42a4f5";
		this.uis    = {};
	}
	AddLevel(levelW, levelH) {
		if (this.level != null) {
			throw new Error("tried to add level to a scene that already has a level");
		}
		this.level = new Level(levelW, levelH);
	}
	AddPlayer() {
		if (this.player != null) {
			throw new Error("tried to add a player to a scene that already has a player");
		}
		this.player = new Player(new Vec2(16, 16));
	}
	SetBG(colour) {
		this.bg = colour;
	}
	AddUIElement(name, element) {
		this.uis[name] = element;
	}
}

export class Project {
	constructor() {
		this.scenes       = {};
		this.currentScene = null;

		// create a canvas
		let canvas = document.createElement("canvas");
		canvas.setAttribute("id", "gameCanvas");
		document.body.appendChild(canvas);
	}
	UpdateCanvas() {
		let canvas = document.getElementById("gameCanvas");
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	Start() {}
	Update() {}
	CurrentScene() {
		if (this.currentScene == null) {
			return null;
		}
		return this.scenes[this.currentScene];
	}
	AddScene(name) {
		this.scenes[name] = new Scene();
	}
	SwitchToScene(name) {
		this.currentScene = name;
	}
	GetScene(name) {
		if (this.scenes[name] == undefined) {
			throw new Error("Unknown scene " + name);
		}
		return this.scenes[name];
	}
	SetFont(font) {
		document.getElementById("gameCanvas").getContext("2d").font = font;
	}
	DoFrame() {
		let scene = this.CurrentScene();
		if ((this.currentScene != null) && (this.CurrentScene().player != null)) {
			scene.player.DoPhysics(scene.level);
		}
		this.Update();

		// render
		const canvas = document.getElementById("gameCanvas");
		const ctx    = canvas.getContext("2d");

		if (scene != null) {
			ctx.fillStyle = scene.bg;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			if (scene.player != null) {
				ctx.fillStyle = "#00ff00";
				ctx.fillRect(scene.player.pos.x, scene.player.pos.y, scene.player.hitbox.x, scene.player.hitbox.y);
			}
			for (const [key, value] of Object.entries(scene.uis)) {
				value.Render(ctx);
			}
		}
		else {
			ctx.fillStyle = "#000000";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
	}
	ClickEvent(e) {
		if (this.CurrentScene() == null) {
			return;
		}

		for (const [key, value] of Object.entries(this.CurrentScene().uis)) {
			//console.log(`${key}: `, value instanceof Button);
			if (value instanceof Button) {
				if (value.IsMouseOver(new Vec2(e.clientX, e.clientY))) {
					value.onclick(this, e);
				}
			}
			else {
				throw new Error("Unknown UI element type (" + key + ")");
			}
		}
	}
	Run() {
		this.UpdateCanvas();
		this.Start();
		setInterval(this.DoFrame.bind(this), 1000 / 60);
		//setInterval(this.UpdateCanvas, 1000 / 5);
		addEventListener("resize", this.UpdateCanvas);
		addEventListener("click", this.ClickEvent.bind(this));
	}
}