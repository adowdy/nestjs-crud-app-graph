import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  private usersFile = path.join(__dirname, '..', 'users.json');

  constructor() {
    this.seedData();
  }

  // create a dummy file that represents a fake set of users with relationships to others
  /* rough relation representation for seed users:
    (1) --- (2) --- (3) 
      \             /
      (4) ----------     (5)
  
  */
  private seedData() {
    if (!fs.existsSync(this.usersFile) || fs.readFileSync(this.usersFile, 'utf8').trim() === '') {
      const initialUsers = [
        { id: 1, relations: [2, 4] },
        { id: 2, relations: [1, 3] },
        { id: 3, relations: [2, 4] },
        { id: 4, relations: [3, 1] },
        { id: 5, relations: [    ] },
      ];
      this.writeUsers(initialUsers);
    }
  }

  private readUsers() {
    try {
      const data = fs.readFileSync(this.usersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private readUserMap(): Map<number, Set<number>> {

    // don't think too hard about this, i'm just faking out an ORM response that would give me a map for convenience
    const data = fs.readFileSync(this.usersFile, 'utf8');
    const usersArray = JSON.parse(data);
    const usersMap = new Map<number, Set<number>>();

    usersArray.forEach(user => {
      usersMap.set(user.id, new Set(user.relations));
    });

    return usersMap;
    
  }
  

  private writeUsers(users: any[]) {
    fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2), 'utf8');
  }

  create(createUserDto: CreateUserDto) {
    const users = this.readUsers();
    const newUser = { id: users.length + 1, ...createUserDto };
    users.push(newUser);
    this.writeUsers(users);
    return newUser;
  }

  findAll() {
    return this.readUsers();
  }

  findOne(id: number) {
    const users = this.readUsers();
    return users.find(user => user.id === id);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const users = this.readUsers();
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex > -1) {
      users[userIndex] = { ...users[userIndex], ...updateUserDto };
      this.writeUsers(users);
      return users[userIndex];
    }
    return null;
  }

  remove(id: number) {
    const users = this.readUsers();
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex > -1) {
      users.splice(userIndex, 1);
      this.writeUsers(users);
      return { message: `User with id ${id} deleted` };
    }
    return null;
  }

  // distance = number of relational 'hops' we find from start user to destination user
  // O (nodes + edges) search of graph complexity - target BFS
  getRelationDistance(startId: number, destId: number): number {
    if (startId == destId) { return 0; }
    const usersMap = this.readUserMap();
    console.log('map of graph' , usersMap);
    const queue = [ {id: startId, dist: 0}]; // seed queue line /w start position.
    let revealed = [] // track 'revealed' nodes to avoid retracing steps

    // traverse queue of nodes, add new ones to queue as we explore + find them
    while (queue.length > 0) {
      const user = queue.shift(); // fifo array, grab + remove first in line
      const relations = usersMap.get(user.id) || [];
      console.log('traversal at', user.id, ' relations:', relations);
      if(user.id == destId) {
        return user.dist;
      }

      if(!revealed.includes(user.id)) {
        console.log('we revealed a new node', user.id)
        revealed.push(user.id);
      }
      
      // add relations we found to the queue to be searched -- if they are not already visited
      for (const relation of relations) {
        if(!revealed.includes(relation)) {
          // tricky bit here is each queue traversal path has to track its own distance
          queue.push( { id: relation, dist: user.dist + 1 } );
          // even tricker bit - we mark 'revealed' to avoid queueing the same node twice
          // i didn't catch this till testing a specific usecase.
          console.log('we revealed a new node from relations', relation)
          revealed.push(relation);
        }
      }
      
    } // queue emptied

    return -1; // default pass thru. we didn't find a path
  }

}

