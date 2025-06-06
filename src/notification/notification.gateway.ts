import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',  // Adjust this for security
  },
  namespace: '/ws', // This creates a WebSocket-specific URL like ws://yourdomain.com/ws
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('sendMessage')
  handleMessage(client: any, payload: any): void {
    console.log('New message:', payload);
    this.server.emit('receiveMessage', payload);
  }

  sendNotification(data: any) {
    this.server.emit('newNotification', data);
  }
}
