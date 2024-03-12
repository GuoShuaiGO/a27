/*
Template Name: Massive
Author: GrayGrids
*/

(function () {
    //===== Prealoder

    window.onload = function () {
        window.setTimeout(fadeout, 500);
    }

    function fadeout() {
        document.querySelector('#loading-area').style.opacity = '0';
        document.querySelector('#loading-area').style.display = 'none';
    }

    /*=====================================
    Sticky
    ======================================= */
    window.onscroll = function () {
        var header_navbar = document.querySelector(".navbar-area");
        var sticky = header_navbar.offsetTop;

        if (window.pageYOffset > sticky) {
            header_navbar.classList.add("sticky");
        } else {
            header_navbar.classList.remove("sticky");
        }
        // show or hide the back-top-top button
        var backToTo = document.querySelector(".scroll-top");
        if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
            backToTo.style.display = "flex";
        } else {
            backToTo.style.display = "none";
        }
    };

    // for menu scroll 
    var pageLink = document.querySelectorAll('.page-scroll');

    pageLink.forEach(elem => {
        elem.addEventListener('click', e => {
            e.preventDefault();
            document.querySelector(elem.getAttribute('href')).scrollIntoView({
                behavior: 'smooth',
                offsetTop: 1 - 60,
            });
        });
    });

    //===== close navbar-collapse when a  clicked
    let navbarToggler = document.querySelector(".navbar-toggler");
    var navbarCollapse = document.querySelector(".collapse");

    document.querySelectorAll(".page-scroll").forEach(e =>
        e.addEventListener("click", () => {
            navbarToggler.classList.remove("active");
            navbarCollapse.classList.remove('show')
        })
    );
    navbarToggler.addEventListener('click', function () {
        navbarToggler.classList.toggle("active");
    })
    // WOW active
    new WOW().init();


    //===login js 前端向后端发送请求
    function login() {
        // 获取表单数据并转换为JSON对象
        var formData = $('#account-form').serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});
    
        $.ajax({
            type: "post",
            dataType: "json",
            contentType: "application/json", // 设置Content-Type为application/json
            url: "http://1270778.js.cn:2700/login/pwd",
            data: JSON.stringify(formData), // 将对象转换为JSON字符串
            success: function (result) {
                console.log(result);
                if (result.status == 200) {
                    alert(result.msg); // 打印服务端返回的数据(调试用)
                    // 存储 access_token 和 refresh_token
                    var access_token = result.data.access_token;
                    var refresh_token = result.data.refresh_token;
                    var ExpirationTime = Date.now() + (24 * 60 * 60 * 1000); // 1 day
                    localStorage.setItem('access_token', access_token);
                    localStorage.setItem('refresh_token', refresh_token);
                    localStorage.setItem('access_token_expiration', ExpirationTime);
                    // 其他操作或重定向到其他页面
                }
            },
            error: function () {
                alert("登录异常！");
            }
        });
    }
    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('loginButton_pwd').addEventListener('click', login);
    });
    //==token 刷新

    function isAccessTokenExpired() {// 检查 access_token 是否过期
        var expirationTime = localStorage.getItem('access_token_expiration');
        var currentTime = Date.now();
        return currentTime >= expirationTime;
    }


    function refreshAccessToken() {// 刷新 access_token
        var refreshToken = localStorage.getItem('refresh_token');

        // 向后端发送刷新令牌的请求
        $.ajax({
            url: 'http://1270778.js.cn:2700/login/refresh',
            method: 'GET',
            data: {
                Authorization: refreshToken
            },
            success: function (response) {
                var newAccessToken = response.data.access_token;
                var newExpirationTime = Date.now() + (24 * 60 * 60 * 1000); // 1 day

                // 更新本地存储的 access_token 和过期时间
                localStorage.setItem('access_token', newAccessToken);
                localStorage.setItem('access_token_expiration', newExpirationTime);

                // 继续进行其他操作或发送其他请求
            },
            error: function (xhr, status, error) {
                // 处理刷新令牌错误
                alert("令牌刷新错误！");
            }
        });
    }

    // 发送请求前检查 access_token 是否过期
    function sendRequestWithAccessToken() {
        if (isAccessTokenExpired()) {
            refreshAccessToken();
        }

        // 在请求中添加 access_token
        var accessToken = localStorage.getItem('access_token');
        // 发送请求


    }

    function logout() {// 登出
        if (isAccessTokenExpired()) {
            refreshAccessToken();
        }
        var accessToken = localStorage.getItem('access_token');
        // 发送登出请求
        $.ajax({
            url: 'http://1270778.js.cn:2700/login/out',
            method: 'GET',
            headers: {
                'Authorization': accessToken
            },
            success: function () {
                // 清除本地存储的令牌和过期时间
                localStorage.removeItem('access_token');
                localStorage.removeItem('access_token_expiration');

                // 清除 SessionStorage
                sessionStorage.clear();

                // 执行其他登出后的操作
            },
            error: function (xhr, status, error) {
                // 处理登出请求错误
                alert("登出错误！");
            }
        });
    }


    //======login-form======
    // 获取账号登录和验证码登录按钮和表单元素
    const accountLoginBtn = document.getElementById('account-login-btn');
    const verificationLoginBtn = document.getElementById('verification-login-btn');
    const wechatLoginButtons = document.querySelectorAll('.wechat-login');// 有多个wechat-login按钮图标所以这里用class选择器

    const accountForm = document.getElementById('account-form');
    const verificationForm = document.getElementById('verification-form');
    const qrcodeContainer = document.getElementById('qrcode-container');

    // 监听账号登陆选择和验证码登录选择的点击事件
    accountLoginBtn.addEventListener('click', function () {
        // 显示账号密码登录表单，隐藏验证码登录表单
        accountForm.style.display = 'block';
        verificationForm.style.display = 'none';
        qrcodeContainer.style.display = 'none';
    });

    verificationLoginBtn.addEventListener('click', function () {
        // 显示验证码登录表单，隐藏账号密码登录表单
        accountForm.style.display = 'none';
        verificationForm.style.display = 'block';
        qrcodeContainer.style.display = 'none';
    });

    wechatLoginButtons.forEach((button) => {
        button.addEventListener('click', function (event) {
            event.preventDefault(); // 阻止默认的链接行为

            // 在这里获取微信扫描的二维码并设置给 qrcodeContainer
            const sessionId = "1"; // 替换为实际的 sessionId

            // 发送 AJAX 请求
            const url = `http://1270778.js.cn:2700/login/wx/code?sessionId=${sessionId}`;
            $.ajax({
                url: url,
                type: 'GET',
                success: function (response) {
                    // 请求成功
                    const qrcodeImageURL = response.data;
                    // 隐藏登录表单
                    accountForm.style.display = 'none';
                    verificationForm.style.display = 'none';

                    // 显示二维码容器
                    qrcodeContainer.style.display = 'flex';

                    // 设置二维码图片 URL
                    const qrcodeImage = qrcodeContainer.querySelector('.qrcode');
                    qrcodeImage.src = qrcodeImageURL;
                },
                error: function (xhr, status, error) {
                    // 请求失败
                    console.error('请求二维码Error:', error);
                    alert("微信二维码获取错误！");
                }
            });
        });
    });


})();