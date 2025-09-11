package internal

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"

	"google.golang.org/grpc"
	pb "perfice.adoe.dev/proto"
	"perfice.adoe.dev/util"
)

func (a *AuthApp) setupGrpcServer(sessionService *SessionService, authService *AuthService) {
	grpcServer := grpc.NewServer()

	userGrpc := &UserServStruct{
		sessionService: sessionService,
		authService:    authService,
	}
	pb.RegisterUserServiceServer(grpcServer, userGrpc)

	port := os.Getenv("GRPC_PORT")
	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("ERROR STARTING THE SERVER : %v", err)
	}

	// start serving to the address
	fmt.Println("Serving GRPC on port " + port)
	go func() {
		log.Fatal(grpcServer.Serve(lis))
	}()
}

type UserServStruct struct {
	sessionService *SessionService
	authService    *AuthService
	jwtSecret      []byte
	pb.UnimplementedUserServiceServer
}

func (u UserServStruct) Authenticate(ctx context.Context, req *pb.AuthenticationRequest) (*pb.AuthenticationResponse, error) {
	sub, session, err := u.sessionService.AuthenticateToken(req.Token)
	if err != nil {
		return &pb.AuthenticationResponse{Result: &pb.AuthenticationResponse_Error{Error: "Invalid token"}}, nil
	}

	return &pb.AuthenticationResponse{
		Result: &pb.AuthenticationResponse_Auth{
			Auth: &pb.SuccessfulAuthenticationResponse{
				UserId:    sub,
				SessionId: session,
			}},
	}, nil
}

func (u UserServStruct) GetSessions(ctx context.Context, req *pb.GetSessionsRequest) (*pb.GetSessionsResponse, error) {
	sessions, err := u.sessionService.GetSessions(req.UserId)
	if err != nil {
		return nil, err
	}

	return &pb.GetSessionsResponse{
		Sessions: util.SliceMap(sessions, func(session Session) *pb.Session {
			return &pb.Session{
				Id:     session.Id,
				UserId: session.User,
				Expiry: session.Expiry,
			}
		}),
	}, nil
}

func (u UserServStruct) GetUserTimeZone(ctx context.Context, req *pb.GetUserTimeZoneRequest) (*pb.GetUserTimeZoneResponse, error) {
	timezone, err := u.authService.GetUserTimeZone(req.UserId)
	if err != nil {
		return nil, err
	}

	return &pb.GetUserTimeZoneResponse{Timezone: timezone}, nil
}

func (u UserServStruct) GetUsersTimeZones(ctx context.Context, req *pb.GetUsersTimeZonesRequest) (*pb.GetUsersTimeZonesResponse, error) {
	timezones, err := u.authService.GetUsersTimeZones(req.UserIds)
	if err != nil {
		return nil, err
	}

	return &pb.GetUsersTimeZonesResponse{Timezones: timezones}, nil
}
