package server;

import java.io.IOException;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.util.ArrayList;
import java.util.List;

public class ChatServer {
    static ServerSocket serverSocket;
    static ClientHandler clientHandler;
    static Thread thread, messagerThread;
    private static final int MAX_BACKLOG = 32;
    static List<ThreadMessageQ> mQueues;

    public static void main(String[] args) {
        mQueues = new ArrayList<>();
        try{
            InetAddress ipAddr = InetAddress.getByName(args[0]);
            int serverPort = Integer.parseInt(args[1]);
        
            serverSocket = new ServerSocket(serverPort, MAX_BACKLOG, ipAddr);
            System.out.println("Server IP: " + ipAddr.toString());

            ClientMessager cm = new ClientMessager(mQueues);
            messagerThread = new Thread(cm);
            messagerThread.start();

            while (true){
                clientHandler = new ClientHandler(serverSocket.accept(),mQueues);
                thread = new Thread(clientHandler);
                thread.start();
            }
        
        } catch (IOException exc){
            System.out.println(exc);
        }
    }
}

