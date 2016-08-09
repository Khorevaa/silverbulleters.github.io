/**
 * Created by kardi on 05.08.2016.
 */


/**===========================================================
 * Templates for jQuery
 * */

(function ($, undefined) {

    var ITEMS_PER_PAGE = 100,
        ORGANIZATIONS = [
            {
                'repos': 'https://api.github.com/orgs/silverbulleters/repos',
                'events': 'https://api.github.com/orgs/silverbulleters/events?per_page=' + ITEMS_PER_PAGE,
                'name': 'silverbulleters',
                'category': 'Инструменты для разработчика'
            },
            {
                'repos': 'https://api.github.com/orgs/VanessaDockers/repos',
                'events': 'https://api.github.com/orgs/VanessaDockers/events?per_page=' + ITEMS_PER_PAGE,
                'name': 'VanessaDockers',
                'category': 'Облачные контейнеры'
            },
            {
                'repos': 'https://api.github.com/orgs/silverbulleters-research/repos',
                'events': 'https://api.github.com/orgs/silverbulleters-research/events?per_page=' + ITEMS_PER_PAGE,
                'name': 'silverbulleters-research',
                'category': 'Исследовательские проекты'
            }
        ],
        COMMENTS_MAX_COUNT = 4,
        MAX_OFFSET_DATE = 7,
        DATES_FORMAT = 'YYYY-MM-DD',
        event_types = {
            "IssuesEvent": {
                'git_name': 'issue'
            },
            "IssueCommentEvent": {
                'git_name': 'issue',
                'name': 'Добавил комментарий'
            },
            "CommitCommentEvent": {
                'git_name': 'commit',
                'name': 'Добавил комментарий'
            },
            "PullRequestEvent": {
                'git_name': 'pull request'
            },
            "PushEvent": {
                'git_name': 'push'
            },
            "ForkEvent": {
                'git_name': 'fork'
            },
            "WatchEvent": {
                'git_name': 'watch'
            },
            "CreateEvent": {
                'git_name': 'create'
            }
        },
        action_classes = {
            'issue opened': 'primary',
            'issue closed': 'danger',
            'commit ': 'primary',
            'pull request ': 'info',
            'pull request closed': 'success',
            'pull request opened': 'info',
            'push ': 'success',
            'watch ': 'success',
            'create ': 'success',
            'fork ': 'success'
        };

    function tmpl(template_type, items, addTo, direction) {

        var htmlEntities = function (str) {
                return String(str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            },
            replaceTags = function (html, object) {
                $.each(object, function (key, value) {
                    var key_expr = new RegExp('{' + key + '}', 'gim');
                    if ($.type(value) == 'string') {
                        value = htmlEntities(value);
                    } else if (value instanceof jQuery) {
                        var _value = [];
                        value.each(function () {
                            "use strict";
                            _value.push(this.outerHTML);
                        });
                        value = _value.join('');
                    } else if (value == null) {
                        value = '';
                    }
                    html = html ? html.replace(key_expr, value) : '';
                });
                var not_handled_keys = new RegExp(/\{.*?\}/gim);
                html = html ? html.replace(not_handled_keys, '') : '';
                return html;
            },

            result = '',
            html_val = (typeof template_type == 'object') ? template_type.tmpl : $('#tmpl-' + template_type).html(), //Р”РѕР±Р°РІР»СЏСЋ РІРѕР·РјРѕР¶РЅРѕСЃС‚СЊ РїРµСЂРµРґР°С‡Сѓ СЃСЂР°Р·Сѓ С‚РµР»Р° С€Р°Р±Р»РѕРЅР°, Р° РЅРµ СЃРµР»РµРєС‚РѕСЂР°
            comments = new RegExp(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gim),
            spaces = new RegExp('\\s{2,}', 'igm');
        if (html_val === undefined || items === undefined) {
            console.group('tmpl_error');
            console.log('error in ' + template_type);
            console.log('items', items);
            console.log('addTo', addTo);
            console.log('html_val', html_val);
            console.log('inputs', {template_type: template_type, items: items, addTo: addTo, direction: direction});
            console.groupEnd();
        }
        html_val = html_val ? html_val.replace(comments, '') : '';
        html_val = html_val ? html_val.replace(spaces, '').trim() : '';
        if (Array.isArray(items)) {
            var i, items_length = items.length;
            for (i = 0; i < items_length; i++) {
                result += replaceTags(html_val, items[i]);
            }
        } else {
            result = replaceTags(html_val, items);
        }
        result = $(result);
        if (addTo == null || addTo == undefined) {
            return result;
        }
        if (direction == 'prepend') {
            addTo.prepend(result);
        } else {
            addTo.append(result);
        }
        return result;
    }


    $(document).ready(function () {


        var errorCallback = function () {

            },
            stats = {
                repos_count: 0,
                stars_count: 0,
                watchers_count: 0
            },
            getRepoData = function (index, callback) {
                $.ajax({
                    url: ORGANIZATIONS[index].repos,
                    dataType: 'JSON',
                    success: callback,
                    error: errorCallback
                });
            },
            getOrganizationEvents = function (index, callback) {
                $.ajax({
                    url: ORGANIZATIONS[index].events,
                    dataType: 'JSON',
                    success: callback,
                    error: errorCallback
                });
            },
            appendOrganization = function ($repos, category, result) {
                $repos.append(tmpl('category-title', {category: category}));
                var $row = tmpl('row', {}),
                    counter = 0;
                stats.repos_count += result.length;
                result.forEach(function (item, index) {
                    if (++counter == 4) {
                        $repos.append($row);
                        counter = 1;
                        $row = tmpl('row', {});
                    }
                    stats.stars_count += item.stargazers_count;
                    stats.watchers_count += item.watchers_count;

                    tmpl('repo', item, $row);

                    if (index == result.length - 1) {
                        $repos.append($row);
                    }

                });
            };

        var repos_all = [],
            $repos = $('#repos'); // main container
        (function getNextOrganization(index) {
            getRepoData(index, function (repos) {
                repos.sort(function (a, b) {
                    return b.watchers_count - a.watchers_count;
                });
                appendOrganization($repos, ORGANIZATIONS[index].category, repos); // build repos of first organization
                repos_all = repos_all.concat(repos);
                if (++index < ORGANIZATIONS.length) { // get next
                    getNextOrganization(index);
                } else { // show everything
                    $repos.removeClass('hidden');
                    buildStats(stats);
                }
            })
        })(0);

        function initSparkLine() {
            var $element = $(this),
                options = $element.data(),
                values = options.values && options.values.split(',');

            options.type = options.type || 'bar'; // default chart is bar
            options.disableHiddenCheck = true;

            $element.sparkline(values, options);

            if (options.resize) {
                $(window).resize(function () {
                    $element.sparkline(values, options);
                });
            }
        }

        function formatDate(date) {
            var diff = new Date() - date; // разница в миллисекундах

            if (diff < 1000) { // прошло менее 1 секунды
                return 'только что';
            }

            var sec = Math.floor(diff / 1000); // округлить diff до секунд

            if (sec < 60) {
                return sec + ' сек. назад';
            }

            var min = Math.floor(diff / 60000); // округлить diff до минут
            if (min < 60) {
                return min + ' мин. назад';
            }


            var hours = Math.floor(diff / 3600000); // округлить diff до часов
            if (hours < 24) {
                return hours + ' ч. назад';
            }

            var days = Math.floor(diff / 86400000); // округлить diff до дней
            if (days < 24) {
                return days + ' дн. назад';
            }

            // форматировать дату, с учетом того, что месяцы начинаются с 0
            var d = date;
            d = [
                '0' + d.getDate(),
                '0' + (d.getMonth() + 1),
                '' + d.getFullYear(),
                '0' + d.getHours(),
                '0' + d.getMinutes()
            ];

            for (var i = 0; i < d.length; i++) {
                d[i] = d[i].slice(-2);
            }

            return d.slice(0, 3).join('.') + ' ' + d.slice(3).join(':');

        }

        function getCommentItemData(action) {
            return {
                avatar_url: action.actor.avatar_url,
                repo_name: action.repo.name.split('/')[1], // removing organization name
                login: action.actor.login,
                type_name: event_types[action.type].git_name,
                event_url: action.payload.comment.html_url,
                title: action.payload.hasOwnProperty('issue') ? action.payload.issue.title : action.payload.comment.commit_id,
                repo_url: action.repo.url,
                name: event_types[action.type].name,
                body: action.payload.comment.body
            }
        }

        function getActionItem(action) {
            var html_url = null,
                action_name = ' ' + (action.payload.action ? action.payload.action : '');
            switch (action.type) {
                case 'IssuesEvent': {
                    html_url = action.payload.issue.html_url;
                    break;
                }
                case 'PullRequestEvent': {
                    html_url = action.payload.pull_request.html_url;
                    break;
                }
                case 'PushEvent': {
                    html_url = action.repo.url;
                    break;
                }
            }
            return {
                html_url: html_url,
                avatar_url: action.actor.avatar_url,
                login: action.actor.login,
                git_name: event_types[action.type].git_name,
                action_name: action_name,
                date_text: formatDate(new Date(action.created_at)),
                action_class: action_classes[event_types[action.type].git_name + action_name]
            }
        }

        function buildStats(stats) {
            var events_all = [];
            // recursively get events for all organizations
            (function getNextEvents(index) {
                getOrganizationEvents(index, function (events) {
                    events_all = events_all.concat(events);
                    if (++index < ORGANIZATIONS.length) {
                        getNextEvents(index);
                    } else {
                        var min_date = moment().add('days', -MAX_OFFSET_DATE),
                            today = moment(),
                            comments_count = 0,
                            event_in_period = 0,
                            events_by_days = {},
                            sparkline_data = [],
                            created_at_diff_max = today.diff(moment(events_all[events_all.length - 1].created_at), 'days'),
                            $comments = $('#comments-body'),
                            $last_actione = $('#last-actions-tbody');

                        created_at_diff_max = created_at_diff_max > 7 ? MAX_OFFSET_DATE : created_at_diff_max;

                        events_all.forEach(function (action) {
                            if (action.type.toLowerCase().indexOf('comment') != -1) {
                                if (comments_count++ >= COMMENTS_MAX_COUNT) return true;
                                tmpl('comment-item', getCommentItemData(action), $comments);
                            } else {
                                event_in_period++;

                                if (event_in_period < 10) {
                                    tmpl('last-action-item', getActionItem(action), $last_actione);
                                }

                                var event_date = moment(action.created_at);
                                if (event_date < min_date) return true;
                                var __key = '_' + event_date.format(DATES_FORMAT);
                                if (events_by_days.hasOwnProperty(__key) == false) {
                                    events_by_days[__key] = 1;
                                } else {
                                    events_by_days[__key]++;
                                }
                            }
                        });

                        $.each(events_by_days, function (key, value) {
                            sparkline_data.push(value);
                        });

                        stats.days_count = created_at_diff_max;
                        stats.count = event_in_period;
                        stats.sparkline_data = sparkline_data.join(',');
                        tmpl('stats-panel-body', stats, $('#stats-panel'));

                        $('[data-sparkline]').each(initSparkLine);
                        $('.action-item').each(function () {
                            var $this = $(this);
                            $this
                                .addClass('clickable')
                                .on('click', function () {
                                    window.open($this.data('url'), '_blank');
                                });
                        })
                    }
                })
            })(0);
        }

        $('.call-to-us').click(function () {
            $('#zcwMiniButton').click();
        });

        $('.subscribe-to-us').on('click', function () {
            var $form = $('<form action="//silverbulleters.us9.list-manage.com/subscribe/post?u=46a46ed97ba2ac2245b0b58af&amp;id=478b2608a9" method="post" target="_blank">' +
                '<input type="email" value="" name="EMAIL">' +
                '</form>');
            swal({
                title: 'Подписаться на новости',
                animation: "slide-from-top",
                type: "input",
                showCancelButton: true,
                closeOnConfirm: false,
                confirmButtonText: "Подписаться!",
                cancelButtonText: "Отмена",
                inputPlaceholder: "Введите ваш Email",
                text: 'Подпишитесь на нашу рассылку и Вы всегда будете в курсе событий',
            }, function (inputValue) {
                if (inputValue === false) return false;
                if (inputValue === "") {
                    swal.showInputError("Введите, пожалуйста, Ваш email!");
                    return false
                }
                $form.find('input').val(inputValue);
                $form.submit();
            });
        })
    });
})(jQuery);