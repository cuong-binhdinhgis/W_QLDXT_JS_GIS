/**
 * Điều khiển một preloading khi chạy trang web
 */
class Loader {
    /**
     * Hiển thị một trang loading
     */
    static show() {
        this.wrapper = document.createElement('div');
        this.wrapper.id = 'loader-wrapper';
        var loader = document.createElement('div');
        loader.id = 'loader';
        this.wrapper.appendChild(loader);
        var loaderImg = document.createElement('div');
        loaderImg.id = 'loader-img';
        this.wrapper.appendChild(loaderImg);
        document.body.appendChild(this.wrapper);
    }
    /**
     * ẩn trang loading
     */
    static hide() {
        if (document.body.contains(this.wrapper))
            document.body.removeChild(this.wrapper);
    }

}