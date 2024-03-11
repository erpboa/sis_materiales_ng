import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { forkJoin } from 'rxjs';
import {UserService} from "./core/user/user.service";

export const initialDataResolver = () =>
{
    /*const notificationsService = inject(NotificationsService);
    const quickChatService = inject(QuickChatService);
    const messagesService = inject(MessagesService);*/
    const navigationService = inject(NavigationService);
    //const shortcutsService = inject(ShortcutsService);
    const userService = inject(UserService);

    // Fork join multiple API endpoint calls to wait all of them to finish
    return forkJoin([
        /*notificationsService.getAll(),
        quickChatService.getChats(),
        messagesService.getAll(),*/
        navigationService.get(),
        //shortcutsService.getAll(),
        userService.get()
    ]);
};
