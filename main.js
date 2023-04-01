var data = {
	coins: 0,
	prestiges: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	banked: 0,
	growthMultiBuys: 0,
	permananos: 0,
	auto: 0,
	ascends: 0,
};

function numtostr(n) {
	if (n < 1000000) return "" + n;
	return n.toExponential(3);
}

function getGrowthMulti() {
	return Math.pow(0.95, data.growthMultiBuys)
}

function getGain() {
	var gain = 1 + data.prestiges[0] + data.permananos;
	for (var i = 1; i < 10; i++) {
		gain *= 1 + data.prestiges[i];
	}
	return gain + data.banked;
}

function getRequirement(id) {
	if (id === 0) {
		return Math.floor(Math.pow(1.5, data.prestiges[0] * getGrowthMulti()) * 10);
	} else {
		return Math.round(Math.pow((id) * getGrowthMulti() + 1, data.prestiges[id] * getGrowthMulti() + 1));
	}
}

function canActivatePrestige(id) {
	if (id < data.auto) {
		return false;
	} if (id === 0) {
		return (data.coins >= getRequirement(0));
	} else if (id === 1) {
		return (data.prestiges[id - 1] + data.permananos >= getRequirement(id));
	} else {
		return (data.prestiges[id - 1] >= getRequirement(id));
	}
}

function activatePrestige(id) {
	if (canActivatePrestige(id)) {
		while (canActivatePrestige(id)) {
			data.prestiges[id]++;
		}
		data.coins = 0;
		for (var i = 0; i < id; i++) {
			data.prestiges[i] = 0;
		}
	}
	draw();
}

function autoActivatePrestige(id) {
	while (canActivatePrestige(id)) {
		data.prestiges[id]++;
	}
}

function getResetScaleCost() {
	return Math.ceil(Math.pow(2 + data.growthMultiBuys / 32, 10 + data.growthMultiBuys));
}

function canResetScaleCost() {
	return data.coins >= getResetScaleCost();
}

function resetScaleCost() {
	if (canResetScaleCost()) {
		data.coins = 0;
		for (var i = 0; i < 10; i++) {
			data.prestiges[i] = 0;
		}
		data.growthMultiBuys += 1;
	}
}


function canResetRetainIncome() {
	return data.prestiges[2] > 0;
}

function resetRetainIncome() {
	if (canResetRetainIncome()) {
		data.coins = 0;
		data.banked = Math.ceil(getGain() * 0.9)
		for (var i = 0; i < 10; i++) {
			data.prestiges[i] = 0;
		}
	}
}

function canResetPermaNano() {
	return data.prestiges[3] > 0;
}

function resetPermaNano() {
	if (canResetPermaNano()) {
		data.coins = 0;
		data.permananos += data.prestiges[0];
		for (var i = 0; i < 10; i++) {
			data.prestiges[i] = 0;
		}
	}
}

function canResetAutomate() {
	if (data.auto > 9) return false;
	if (data.auto == 0) return data.prestiges[data.auto] + data.permananos > 100;
	return data.prestiges[data.auto] >= 10;
}

function resetAutomate() {
	if (canResetAutomate) {
		data.coins = 0;
		data.auto += 1;
		for (var i = 0; i < 10; i++) {
			data.prestiges[i] = 0;
		}
	}
}

function getAscendRequirement() {
	return Math.pow(data.ascends+1, 2);
}

function canAscend() {
	return data.prestiges[9] >= getAscendRequirement();
}

function ascend() {
	if (canAscend) {
		data.coins = 0;
		data.prestiges = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		data.banked = 0;
		data.growthMultiBuys = 0;
		data.permananos = 0;
		data.auto = 0;
		data.ascends += 1;
	}
}

function update() {
	//scale the gain by the actual number of seconds since the last update
	const curTime = (new Date()).getTime();
	const deltaTime = (data.lastTime === undefined) ? 1 : ((curTime - data.lastTime) / 1000);
	data.lastTime = curTime;
	data.coins += getGain() * deltaTime;
	if (data.coins > 1e308) data.coins = 1e308
	for (var i = 0; i < data.auto; i++) {
		autoActivatePrestige(i);
	}
	localStorage.TRUE_PRESTIGE = JSON.stringify(data);
}

function draw() {
	document.getElementById("coins").innerHTML = numtostr(Math.floor(data.coins));
	document.getElementById("gain").innerHTML = numtostr(getGain());
	data.prestiges.forEach(function (el, i) {
		document.getElementById("tier" + (i + 1) + "cost").innerHTML = numtostr(getRequirement(i));
		document.getElementById("tier" + (i + 1) + "a").innerHTML = numtostr(el + (i == 0 ? data.permananos : 0));
		document.getElementById("tier" + (i + 1) + "mul").innerHTML = "x" + numtostr((el + 1 + (i == 0 ? data.permananos : 0)));
		if (canActivatePrestige(i)) {
			document.getElementById("tier" + (i + 1) + "btn").disabled = false;
		} else {
			document.getElementById("tier" + (i + 1) + "btn").disabled = true;
		}
	});
	if (data.prestiges[2]>0 || data.banked>0) {
		document.getElementById("reset1row").style.display = "table-row"
	} else {
		document.getElementById("reset1row").style.display = "none"
	}
	if (data.banked>100) {
		document.getElementById("reset2row").style.display = "table-row"
	} else {
		document.getElementById("reset2row").style.display = "none"
	}
	if (data.prestiges[3]>0) {
		document.getElementById("reset3row").style.display = "table-row"
	} else {
		document.getElementById("reset3row").style.display = "none"
	}
	if (data.prestiges[0]>50 && data.auto <10) {
		document.getElementById("reset4row").style.display = "table-row"
	} else {
		document.getElementById("reset4row").style.display = "none"
	}
	if (data.prestiges[9]>0) {
		document.getElementById("reset5row").style.display = "table-row"
	} else {
		document.getElementById("reset5row").style.display = "none"
	}
	document.getElementById("reset1btn").disabled = !canResetRetainIncome();
	document.getElementById("scaledown_cost").innerHTML = numtostr(getResetScaleCost());
	document.getElementById("reset2btn").disabled = !canResetScaleCost();
	document.getElementById("reset3btn").disabled = !canResetPermaNano();
	document.getElementById("reset4tier").innerHTML = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "?"][data.auto];
	document.getElementById("reset4btn").disabled = !canResetAutomate();
	document.getElementById("reset5cost").innerHTML = numtostr(getAscendRequirement());
	document.getElementById("reset5btn").disabled = !canAscend();
}

window.addEventListener("load", function () {
	if (localStorage.TRUE_PRESTIGE) {
		data = JSON.parse(localStorage.TRUE_PRESTIGE);
	}
	draw();
	for (var i = 0; i < 10; i++) {
		document.getElementById("tier" + (i + 1) + "btn").addEventListener(
			"click",
			(function (n) {
				return (function () {
					activatePrestige(n);
				});
			}(i))
		);
	}
	this.document.getElementById("reset1btn").addEventListener(
		"click", resetRetainIncome
	)
	this.document.getElementById("reset2btn").addEventListener(
		"click", resetScaleCost
	)
	this.document.getElementById("reset3btn").addEventListener(
		"click", resetPermaNano
	)
	this.document.getElementById("reset4btn").addEventListener(
		"click", resetAutomate
	)
	this.document.getElementById("reset5btn").addEventListener(
		"click", ascend
	)
	mainLoop = function () {
		update();
		draw();
		requestAnimationFrame(mainLoop);
	};
	requestAnimationFrame(mainLoop)
});
