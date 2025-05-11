// import * as express from 'express'
import { 
    Controller, 
    // Path, 
    // Response, 
    Route, 
    Security, 
    // Request,
    Get } from 'tsoa'

// import { SessionUser } from '../'



@Route('police')
export class PoliceController extends Controller {
    @Get('check/plate')
    @Security('jwt', ['police'])
    public async checkPermitByPlate(
        // @Request() request: express.Request & {user: SessionUser}
    ): Promise<boolean> {
        // const currentUser = request.user.id
        // console.log('Current User: ', currentUser)
        return true
    }

    // @Delete('{memberId}')
    // @Security('jwt', ['police'])
    // @Response('404', 'Unknown')
    // public async deleteFriend(
    //     @Path() memberId: midt,
    //     @Request() request: express.Request & {user: SessionUser}
    // ): Promise<Member | undefined> {
    //     const currentUser = request.user?.id
    //     let friendId: string
    //     try {
    //         friendId = getIdFromMidt(memberId)
    //         return new FriendService().deleteFriend(currentUser, friendId)
    //     } catch {
    //         this.setStatus(400)
    //     }
    // }
}