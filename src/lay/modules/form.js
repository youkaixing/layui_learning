layui.define('layer',function(exports){
    'use strict'
    console.log('我是form模块');
    var $ = layui.$,
        layer = layui.layer,
        hint = layui.hint(),
        device = layui.device(),

        MOD_NAME = 'form',ELEM = '.layui-form',HIDE = 'layui-hide',SHOW = 'layui-show',DISABLED = 'layui-disabled',
        Form = function(){
            this.config = {//默认配置项
                verify : {//内置规则
                    required : [
                        /[\S]+/,
                        '必填项不能为空'
                    ],
                    phone : [
                        /^1\d{10}$/,
                        '请输入正确的手机号'
                    ],
                    email : [
                        /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
                        '邮箱格式不正确'
                    ],
                    url : [
                        /(^#)|(^http(s*):\/\/[^\s]+\.[^\s]+)/
                        ,'链接格式不正确'
                    ],
                    number : function(value){
                        if(!value || isNaN(value)){return '只能填写数字'}
                    },
                    date: [
                        /^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1]))*$/
                        ,'日期格式不正确'
                    ],
                    identity: [
                        /(^\d{15}$)|(^\d{17}(x|X|\d)$)/
                        ,'请输入正确的身份证号'
                    ]
                }
            }
        };
    //表单事件监听
    Form.prototype.on = function(events,callback){
        return layui.onevent.call(this,MOD_NAME,events,callback);
    }
    //全局设置
    Form.prototype.set = function(options){
        var that = this;
        $.extend(true,that.config,options);
        return that;
    }
    //验证规则设定
    Form.prototype.verify = function (setting) {
        var that = this;
        $.extend(true,that.config.verify,setting);
        return that;
    }
    Form.prototype.render = function(type,filter){
        var that = this,
            elemForm = $(ELEM + function(){
                return filter ? ('[lay-filter="'+filter+'"]'):'';
            }()),
            items = {
                //下拉选项
                select : function(){
                    var TIPS = '请选择',CLASS = 'layui-form-select',TITLE = 'layui-select-title',THIS = 'layui-this',
                        NONE = 'layui-select-none',DISABLED = 'layui-disabled',initValue = '',thatInput,
                        selects = elemForm.find('select'),hide = function(e,clear){
                            if(!$(e.target).parent().hasClass(TITLE) || clear){
                                $('.' + CLASS).removeClass(CLASS + 'ed ' + CLASS+ 'up');
                                thatInput && initValue && thatInput.val(initValue);
                            }
                            thatInput = null;
                        },
                        events = function(reElem,disabled,isSearch){
                            var select = $(this),
                                title = reElem.find('.' + TITLE),
                                input = title.find('input'),
                                dl = reElem.find('dl'),
                                dds = reElem.find('dd');

                            if(disabled){return}
                            //展开下拉事件
                            var showDown = function(){
                                var top = reElem.offset().top + reElem.outerHeight() + 5 - win.scrollTop(),
                                    dlHeight = dl.outerHeight();
                                reElem.addClass(CLASS + 'ed');
                                dds.removeClass(HIDE);

                                //窗口改变上下识别
                                if(top + dlHeight > win.height() && top >= dlHeight){
                                    reElem.addClass(CLASS + 'up');//上显示
                                }
                            },hideDown = function(choose){
                                reElem.removeClass(CLASS + 'ed ' + CLASS + 'up');
                                input.blur();
                                if(choose){return};

                                notOption(input.val(),function(none){
                                    if(none){
                                        initValue = dl.find('.' + THIS).html();
                                        input && input.val(initValue);
                                    }
                                })

                            }


                            //点击标题区域事件
                            title.on('click',function(e){
                                reElem.hasClass(CLASS + 'ed') ? (
                                        hideDown()
                                    ) : (
                                        hide(e,true),
                                            showDown()
                                    )
                                dl.find('.' + NONE).remove();
                            })
                            //点击监右边监听获取焦点
                            title.find('.layui-edge').on('click',function(){
                                input.focus();
                            })
                            //键盘事件(切换下拉显示隐藏)
                            input.on('keyup',function(e){//按键按期
                                var keyCode = e.keyCode;
                                if(keyCode == 9){//tab
                                    //显示dl
                                    showDown();
                                }
                            }).on('keydown',function(e){
                                var keyCode = e.keyCode;
                                if(keyCode == 9){
                                    hideDown();
                                }
                            })
                            //检查值是否不属于select项
                            var notOption = function(value,callback,origin){
                                var num = 0;
                                layui.each(dds,function(){
                                    var othis = $(this),
                                        text = othis.text(),
                                        not = text.indexOf(value) === -1;//包含字段（失去焦点需要全部相同）
                                    if(value === '' || (origin === 'blur' ? value !== text : not)){num++};
                                    origin === 'keyup' && othis[not ? 'addClass' : 'removeClass'](HIDE);//隐藏/显示dd项
                                })
                                var none = num === dds.length;
                                return callback(none),none;
                            }

                            //dd选择
                            dds.on('click',function(){
                                var othis = $(this),value = othis.attr('lay-value');
                                var filter = othis.attr('lay-filter');

                                if(othis.hasClass(DISABLED)){return false}

                                if(othis.hasClass('layui-select-tips')){
                                    input.val('')
                                }else{
                                    input.val(othis.text());
                                    othis.addClass(THIS);
                                }

                                othis.siblings().removeClass(THIS);
                                select.val(value).removeClass('layui-form-danger');
                                //绑定回调函数
                                layui.event.call(this,MOD_NAME,'select(' + filter + ')',{
                                    elem : select[0],
                                    value : value,
                                    othis : reElem
                                })
                                hideDown(true);

                                return false;
                            })
                            //搜索匹配
                            var search = function(e){
                                var value = this.value,keyCode = e.keyCode;
                                if(keyCode === 9 || keyCode === 13 || keyCode === 37 || keyCode === 38
                                    || keyCode === 39 || keyCode === 40){
                                    return false;
                                }

                                notOption(value,function(none){
                                    if(none){
                                        dl.find('.' + NONE)[0] || dl.append('<p class="' + NONE + '">无匹配项</p>')
                                    }else{
                                        dl.find('.' + NONE).remove();
                                    }
                                },'keyup');
                            }
                            if(isSearch){
                                //绑定keyup事件
                                input.on('keyup',search).on('blur',function(e){
                                    thatInput = input;
                                    initValue = dl.find('.' + THIS).html();
                                    setTimeout(function(){
                                        notOption(input.val(),function(none){
                                            if(none && !initValue){
                                                input.val('');
                                            }
                                        },'blur');
                                    },200)
                                })
                            }

                            //点击文档其他区域关闭下拉
                            $(document).off('click',hide).on('click',hide);
                        }

                    //初始化所有的select
                    selects.each(function(index,select){
                        var othis = $(this),
                            hasRender = othis.next('.' + CLASS),
                            disabled = this.disabled,//是否禁用属性
                            value = this.value,
                            selected = $(select.options[select.selectedIndex]),//获取当前选中的option
                            optionFirst = select.options[0];//第一个option
                        var isSearch = typeof othis.attr('lay-search') === 'string',
                            placeholder = optionFirst ? (optionFirst.value ? TIPS : (optionFirst.innerHTML || TIPS)) : TIPS;//默认取第一个option的innerHTML 否则取默认TIPS
                        //构建替代元素
                        var reElem = $(['<div class="'+(isSearch ? '' : 'layui-unselect ')+ CLASS + (disabled ? ' layui-layer-disabeld' : '') +'">'
                            ,'<div class="'+TITLE+'"><input type="text" placeholder="'+placeholder+'" value="'+(value ? selected.html() : '')+'" ' +(isSearch ? '' : 'readonly')+' class="layui-input' +(isSearch ? '' : ' layui-unselect') + (disabled ? ' ' + DISABLED : '')+'">'
                            ,'<i class="layui-edge"></i></div>'
                            //模拟子项
                            ,'<dl class="layui-anim layui-anim-upbit' + (othis.find('optgroup')[0] ? ' layui-select-group' : '') + '">' + function(options){
                                var arr = [];
                                layui.each(options,function(index,item){
                                    if(index == 0 && !item.value){
                                        arr.push('<dd lay-vaule="" class="layui-select-tips">'+(item.innerHTML || TIPS)+'</dd>');//第一项
                                    }else if(item.tagName.toLowerCase() === 'optgroup'){//下拉组
                                        arr.push('<dt>'+item.label+'</dt>');
                                    }else{
                                        arr.push('<dd lay-value="'+item.value+'" class="'+(value == item.value ? THIS : '')+(item.disabled ? (' ' + DISABLED) : '') + '">'+item.innerHTML+'</dd>')
                                    }
                                })
                                arr.length == 0 && arr.push('<dd lay-value="" class="'+ DISABLED+ '">没有选项</dd>');
                                return arr.join('');//返回字符串
                            }(othis.find('*')) +
                            '</dl>'
                        ,'</div>'].join(''));
                        hasRender[0] && hasRender.remove();//已经渲染 重新渲染
                        othis.after(reElem);
                        events.call(this,reElem,disabled,isSearch);//初始化事件
                    })
                },
                //复选框与开关
                checkbox : function(){
                    var CLASS = {
                        checkbox : ['layui-form-checkbox','layui-form-checked','checkbox'],
                        _switch : ['layui-form-switch','layui-form-onswitch','switch']//开关样式
                    },checks = elemForm.find('input[type=checkbox]'),
                    events = function(reElem,RE_CLASS){
                        var check = $(this);
                        //勾选事件
                        reElem.on('click',function(){
                            //获取过滤器
                            var filter = check.attr('lay-filter'),
                                text = (check.attr('lay-text') || '').split('|');

                            if(check[0].disabled){return}
                            //选中,改为不选中(text文字切换)
                            check[0].checked ? (
                                check[0].checked = false,
                                    reElem.removeClass(RE_CLASS[1]).find('em').text(text[1])
                                ) : (
                                    check[0].checked = true,
                                        reElem.addClass(RE_CLASS[1]).find('em').text(text[0])
                                )

                            //绑定事件回调
                            layui.event.call(check[0],MOD_NAME,RE_CLASS[2] + '(' + filter + ')',{
                                elem : check[0],
                                value : check[0].value,
                                othis : reElem
                            })
                        })
                    }
                    //遍历所有的checkbox
                    checks.each(function(index,check){
                        var othis = $(this),skin = othis.attr('lay-skin'),
                            text = (othis.attr('lay-text') || '').split('|'),disabled = this.disabled;
                        if(skin === 'switch'){skin = '_' + skin};

                        //获取对应的class数组集
                        var RE_CLASS = CLASS[skin] || CLASS.checkbox;

                        //是否进行美化
                        if(typeof othis.attr('lay-ignore') === 'string'){return othis.show()};

                        //创建替代元素
                        var hasRender = othis.next('.' + RE_CLASS[0]);//判断元素是否已经存在
                        var reElem = $(['<div class="layui-unselect '+RE_CLASS[0]+(

                        check.checked ? (' ' + RE_CLASS[1]) : '') + (disabled ? ' layui-checkbox-disabled ' + DISABLED: '') +'" lay-skin="'+(skin || '')+'">'//是否添加lay-skin="primary"原始样式
                        ,{//判断是switch还是普通checkbox
                            _switch : '<em>' +((check.checked ? text[0] : text[1] || ''))+ '</em><i></i>'
                            }[skin] || ((check.title.replace(/\s/g,'') ? ('<span>'+check.title+'</span>') : '') + '<i class="layui-icon">'+(skin ? '&#xe605;' : '&#xe618;')+'</i>')
                            ,'</div>'].join(''));

                        hasRender[0] && hasRender.remove();

                        othis.after(reElem);
                        //初始化事件
                        events.call(this,reElem,RE_CLASS);
                    })
                },
                //单选开关
                radio : function(){
                    var CLASS = 'layui-form-radio',ICONS = ['&#xe643;', '&#xe63f;'],
                        radios = elemForm.find('input[type=radio]'),
                    events = function(reElem,){
                        var radio = $(this),ANIM = 'layui-anim-scaleSpring';//缩放动画

                        reElem.on('click',function(){
                            var name = radio[0].name,forms = radio.parents(ELEM);
                            var filter = radio.attr('lay-filter');
                            //这个正则没看懂
                            var sameRadio = forms.find('input[name='+name.replace(/(\.|#|\[|\])/g,'\\$1')+']');//找到相同name的兄弟元素

                            if(radio[0].disabled){return};

                            layui.each(sameRadio,function(){
                                var next = $(this).next('.' + CLASS);
                                this.checked = false;
                                next.removeClass(CLASS + 'ed');
                                next.find('.layui-icon').removeClass(ANIM).html(ICONS[1]);//圆圈动画(取消选中其他相同name的radio)
                            })

                            radio[0].checked = true;
                            reElem.addClass(CLASS + 'ed');
                            reElem.find('.layui-icon').addClass(ANIM).html(ICONS[0]);//添加动画（ 选中当前radio替代元素）

                            //执行回调
                            layui.event.call(radio[0],MOD_NAME,'radio(' +filter+')',{
                                elem : radio[0],
                                value : radio[0].value,
                                othis : reElem
                            })
                        })
                    }
                    radios.each(function(index,radio){
                        var othis = $(this),hasRender = othis.next('.' + CLASS),disabled = this.disabled;

                        if(typeof othis.attr('lay-ingore') === 'string'){return othis.show()};

                        var reElem = $(['<div class="layui-unselect '+CLASS +(radio.checked ? (' '+ CLASS + 'ed') : '')+(disabled ?' layui-radio-disabled ' + DISABLED : '')+'">'
                        ,'<i class="layui-anim layui-icon">'+ICONS[radio.checked ? 0 : 1]+'</i>',
                         '<span>'+(radio.title || '未命名')+'</span>','</div>'].join(''));

                        hasRender[0] && hasRender.remove();

                        othis.after(reElem);

                        events.call(this,reElem);
                    })
                }
            };
        type ? items[type] ? items[type]() : hint.err('不支持的'+type+'表单渲染') : layui.each(items,function(index,item){
                item();
            })
        return that;
    }
    //提交验证
    var submit = function(){
        var button = $(this),verify = form.config.verify,stop = null,
            DANGER = 'layui-form-danger',filed = {},elem = button.parents(ELEM),

            verifyElem = elem.find('*[lay-verify]'),//获取需要校验的元素集
            formElem = button.parents('form')[0],//当前所在的form元素
            filedElem = elem.find('input,select,textarea'),//所有表单域
            filter = button.attr('lay-filter')//获取过滤器

        //开始校验
        layui.each(verifyElem,function(_,item){
            var othis = $(this),ver = othis.attr('lay-verify').split('|');//获取到校验规则字符串
            var tips = '',value = othis.val();
            othis.removeClass(DANGER);
            layui.each(ver,function(_,thisVer){

                var isFn = typeof verify[thisVer] === 'function';
                //优先判断函数验证,然后正则验证(验证规则存在,未通过时)
                if(verify[thisVer] && (isFn ? tips = verify[thisVer](value,item) : !verify[thisVer][0].test(value))){
                    layer.msg(tips || verify[thisVer][1],{//错误信息提示
                        icon : 5,
                        shift : 6
                    });
                    //PC自动定位焦点
                    if(!device.android && !device.ios){
                        item.focus();
                    }

                    othis.addClass(DANGER);

                    return stop = true;
                }
            })
            if(stop){return stop}
        })

        if(stop){return false}
        //验证通过(收集选中的表单字段)
        layui.each(filedElem,function(_,item){
            if(!item,name){return};
            if(/^checkbox|radio$/.test(item.type) && !item.checked){return};//checkbox,radio项未选中跳过
            filed[item.name] = item.value;
        })

        return layui.event.call(this,MOD_NAME,'submit('+filter+')',{
            elem : this,
            form : formElem,
            filed : filed
        })
    }
    var form = new Form(),dom = $(document),win = $(window);
    form.render();//自动执行渲染，控件
    //表单提交事件(默认submit会执行验证菜户去回调函数中)
    dom.on('submit',ELEM,submit).on('click','*[lay-submit]',submit);
    exports(MOD_NAME,form);
})
