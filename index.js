class PlottingTool {
    constructor() {
        this.backgroundContainer = document.querySelector('.background-container');
        this.imageUpload = document.getElementById('imageUpload');
        this.shapeSize = document.getElementById('shapeSize');
        // Removed: shapeColor reference as colors are now fixed
        this.categorySelect = document.getElementById('categorySelect');
        this.categoryLegend = document.getElementById('categoryLegend');
        
        // Modified: Updated categories with fixed colors
        this.categories = {
            waypoints: { color: 'green', size: 20 },
            ships: { color: 'yellow', size: 25 },
            danger: { color: 'red', size: 30 }
        };
        
        this.setupEventListeners();
        this.updateLegend();
    }

    setupEventListeners() {
        this.imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        
        document.addEventListener('mousemove', (e) => this.handleDrag(e));
        document.addEventListener('mouseup', () => this.isDragging = false);

        document.addEventListener('touchmove', (e) => this.handleTouchDrag(e), { passive: false });
        document.addEventListener('touchend', () => this.stopDragging());
        document.addEventListener('touchcancel', () => this.stopDragging());
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'background-image';
                img.draggable = false;
                img.style.userSelect = 'none';
                this.backgroundContainer.innerHTML = '';
                this.backgroundContainer.appendChild(img);
                this.backgroundContainer.appendChild(this.createLegend());
            };
            reader.readAsDataURL(file);
        }
    }

    addShape(x, y) {
        const category = this.categorySelect.value;
        const shape = document.createElement('div');
        shape.className = 'shape';
        shape.dataset.category = category;
        
        const categoryProps = this.categories[category];
        const size = parseInt(this.shapeSize.value);
        // Modified: Use fixed category color instead of shapeColor
        const color = categoryProps.color;
        
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.backgroundColor = color;
        shape.style.left = `${x}px`;
        shape.style.top = `${y}px`;
        
        this.backgroundContainer.appendChild(shape);
        
        shape.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.isDragging = true;
            this.draggedShape = shape;
            const rect = shape.getBoundingClientRect();
            this.offsetX = e.clientX - rect.left;
            this.offsetY = e.clientY - rect.top;
        });

        shape.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const touch = e.touches[0];
            this.startDragging(shape, touch.clientX, touch.clientY);
        }, { passive: false });
    }

    startDragging(shape, clientX, clientY) {
        this.isDragging = true;
        this.draggedShape = shape;
        const rect = shape.getBoundingClientRect();
        this.offsetX = clientX - rect.left;
        this.offsetY = clientY - rect.top;
    }

    stopDragging() {
        this.isDragging = false;
        this.draggedShape = null;
    }

    handleDrag(e) {
        if (!this.isDragging || !this.draggedShape) return;

        const rect = this.backgroundContainer.getBoundingClientRect();
        let x = e.clientX - rect.left - this.offsetX;
        let y = e.clientY - rect.top - this.offsetY;

        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        this.draggedShape.style.left = `${x}px`;
        this.draggedShape.style.top = `${y}px`;
    }

    handleTouchDrag(e) {
        if (!this.isDragging || !this.draggedShape) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.backgroundContainer.getBoundingClientRect();
        let x = touch.clientX - rect.left - this.offsetX;
        let y = touch.clientY - rect.top - this.offsetY;

        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        this.draggedShape.style.left = `${x}px`;
        this.draggedShape.style.top = `${y}px`;
    }

    // Removed: addCategory method as category creation is no longer needed

    updateLegend() {
        this.categoryLegend.innerHTML = Object.entries(this.categories)
            .map(([name, props]) => `
                <div style="margin: 4px 0;">
                    <span style="display: inline-block; width: 12px; height: 12px; background-color: ${props.color}; margin-right: 8px;"></span>
                    <span>${name.charAt(0).toUpperCase() + name.slice(1)}</span>
                </div>
            `).join('');
    }

    clearMap() {
        this.backgroundContainer.innerHTML = '';
    }
    
    clearCategory(category) {
        const shapes = document.querySelectorAll(`.shape[data-category="${category}"]`);
        shapes.forEach(shape => shape.remove());
    }
}

function clearMap() {
    plotter.clearMap();
}

function clearCategory(category) {
    plotter.clearCategory(category);
}

const plotter = new PlottingTool();

function addShape() {
    const rect = document.querySelector('.plotting-area').getBoundingClientRect();
    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;
    plotter.addShape(x, y);
}