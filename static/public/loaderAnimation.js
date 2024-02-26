
class LoaderAnimation {
	static containerId = 'loader-overlay';
	static styleAdded = false;
    static addStyle() {
        if (!this.styleAdded) {
            const style = document.createElement('style');
            style.textContent = `
			.loader-overlay 		{ display: none; position: fixed; top: 0; bottom: 0; left: 0; right: 0; background-color: rgba(0,0,0,0.2); z-index: 9999; }
			.loader-overlay .loader { border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%;
									width: 24pt; height: 24pt; animation: spin 1s linear infinite; position: absolute;
									top: 50%; left: 50%; margin-top: -12pt; margin-left: -12pt; }
			@keyframes spin 		{ 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
            this.styleAdded = true;
        }
    }
    static start() {
		this.addStyle();
        if (document.getElementById(this.containerId)) return;
        const overlay = document.createElement('div');
        overlay.classList.add('loader-overlay');
        overlay.id = this.containerId;
		overlay.innerHTML = '<div class="loader"></div>';
		overlay.style.display = 'block';
        document.body.appendChild(overlay);
    }
    static stop() {
        const overlay = document.getElementById(this.containerId);
        if (overlay) {
            overlay.parentNode.removeChild(overlay);
        }
    }
}
