'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell, Calendar as CalendarIcon, ChevronDown, FileText, LogOut, Search, User, AlertTriangle, Upload } from "lucide-react"
import { format, set } from "date-fns"
import { useNavigate } from "react-router-dom"

interface LoginState {
  isLogin: boolean;
  token: string;
}

interface Props {
  loginState: LoginState;
  setLogin: React.Dispatch<React.SetStateAction<LoginState>>;
}

interface Event {
  id: string;
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  venue: string;
  organizer: string;
  capacity: number;
  registration: number;
  description: string;
  poster: string;
  approval: string;
}

interface Student {
  name: string;
  email: string;
}

export default function ClubDashboard({ loginState, setLogin }: Props) {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([
    { id: 1, message: "Your event 'Tech Hackathon' has been approved", time: "2 hours ago" },
    { id: 2, message: "New comment on 'Art Exhibition'", time: "5 hours ago" },
    { id: 3, message: "Reminder: 'Career Fair' starts tomorrow", time: "1 day ago" },
  ])

  const [selectedEvent, setSelectedEvent] = useState(null)
  const [cancelConfirmation, setCancelConfirmation] = useState("")
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showRegistrationList, setShowRegistrationList] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [registeredStudents, setRegisteredStudents] = useState<Student[]>([])
  const [showLogoUploadDialog, setShowLogoUploadDialog] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [profileDetails, setProfileDetails] = useState({
    clubName: "",
    clubEmail: "",
    image: "",
    clubPhoneNo: "",
    clubDescription: "",
  })
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])

  //NEW EVENT
  const [eventId, setEventId] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedIsLogin = localStorage.getItem("isLogin");

    if (savedToken && savedIsLogin === "true") {
      setLogin({
        isLogin: true,
        token: savedToken
      })

      fetchUserData(savedToken)
      fetchClubCreatedEvents()
    } else {
      navigate("/club/login")
    }
  }, [])
  

  const fetchUserData = async (token: string) => {
    try {
      console.log()
      const response = await fetch("http://43.205.197.170:8080/club/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        }
      });
      
      console.log(response)
      if (!response.ok) {
        console.log(response.status)
        throw new Error("Failed to fetch user data");
      }

      const clubInfo = await response.json();

      setProfileDetails({
        clubName: clubInfo.data.clubName,
        clubEmail: clubInfo.data.clubEmail,
        image: clubInfo.data.clubLogo,
        clubPhoneNo: clubInfo.data.clubPhoneNo,
        clubDescription: clubInfo.data.clubDescription
      });

    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  const fetchClubCreatedEvents = async () => {
    const token: string = localStorage.getItem("token") as string
    try {
      const response = await fetch("http://43.205.197.170:8080/club/events", {
        method: "GET",
        headers: {
          "Authorization": token
        }
      })

      if (!response.ok) {
        setEvents([])
        setFilteredEvents([])
        throw new Error("Failed to fetch club created events.")
      }
      
      const data = await response.json()
      console.log(data)
      const newEvents = data.map((element: any) => ({
        id: element.eventId,
        title: element.eventName,
        startDate: element.eventStartDate,
        startTime: element.eventStartTime,
        endDate: element.eventEndDate,
        endTime: element.eventEndTime,
        venue: element.venue,
        organizer: element.clubEmail.split("@")[0],
        capacity: element.capacity,
        registration: element.registration,
        description: element.eventDescription,
        poster: element.posterUrl,
        approval: element.approved,
      }));

      setEvents(newEvents)
      setFilteredEvents(newEvents)

    } catch (error) {
      console.log(error)
    }
  }

  const handleLogOut = async () => {
    const token = localStorage.getItem("token")
    if (loginState.isLogin) {
      const sure = confirm("Do you really want to log out ?")
      if (sure) {
        console.log("Maine token delete ker diya")
        const response = await fetch("http://43.205.197.170:8080/club/signout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token
          }
        })
        const data = await response.text()
        navigate("/")

        localStorage.removeItem("token");
        localStorage.removeItem("isLogin");
      }
    } else {
      navigate("/")
    }

  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAttachments(Array.from(event.target.files));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    // Ensure we have at least one attachment
    if (attachments.length === 0) {
      alert("Please select a poster image");
      return;
    }
  
    const formData = new FormData();
    formData.append("eventId", eventId);
    formData.append("eventName", eventTitle);
    formData.append("eventStartDate", startDate ? startDate.toISOString().split('T')[0] : "");
    formData.append("eventStartTime", startTime.toString());
    formData.append("eventEndDate", endDate ? endDate.toISOString().split('T')[0] : "");
    formData.append("eventEndTime", endTime.toString());
    formData.append("venue", venue);
    formData.append("capacity", capacity.toString());
    formData.append("eventDescription", description);
    formData.append("approved", "pending");
    
    // Only append the first attachment
    formData.append("posterImg", attachments[0]);
  
    try {
      const response = await fetch("http://43.205.197.170:8080/club/event/create", {
        method: "POST",
        headers: {
          Authorization: loginState.token
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit the form");
      }

      setEventId("");
      setEventTitle("");
      setStartDate(null);
      setStartTime("");
      setEndDate(null);
      setEndTime("");
      setVenue("");
      setCapacity("");
      setDescription("");
      setAttachments([]);

      alert("Event has been sucessfully created and waiting for approval.")

      fetchClubCreatedEvents()
      
    } catch (error) {
      alert(error)
    }
  };

  const registerdStudentsList = async (id: string) => {
    setShowRegistrationList(true)
    const token: string = localStorage.getItem("token") as string

    try {
      const response = await fetch("http://43.205.197.170:8080/club/registeredstudentslist", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "Authorization": token,
        },
        body: id
      })

      if (!response.ok) {
        console.log("No Student found")
      }

      const result = await response.json()
      console.log(result)
      const newApprovedEvents = result.map((element: any) => ({
        name: element.endUserName,
        email: element.endUserEmail
      }))

      setRegisteredStudents(newApprovedEvents)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setRegisteredStudents([])
  }, [showRegistrationList])

    const handleViewEvent = (event: any) => {
      setSelectedEvent(event)
    }

    const handleCancelEvent = (event: any) => {
      setSelectedEvent(event)
      setShowCancelDialog(true)
    }

    const confirmCancelEvent = () => {
      if (cancelConfirmation.toLowerCase() === "cancel") {
        setAllEvents(allEvents.filter(e => e.id !== selectedEvent.id))
        setEvents(events.filter(e => e.id !== selectedEvent.id))
        setShowCancelDialog(false)
        setCancelConfirmation("")
        setSelectedEvent(null)
      }
  }



  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    if (query === "") {
      setFilteredEvents(events)
    } else {
      const newFilteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query)
      )
      setFilteredEvents(newFilteredEvents)
    }
  }

  // const registeredStudents = [
  //   { name: "John Doe", email: "john@example.com" },
  //   { name: "Jane Smith", email: "jane@example.com" },
  //   { name: "Alice Johnson", email: "alice@example.com" },
  // ]

  

  const handleLogoUpload = async () => {
    setShowLogoUploadDialog(false)
    if (!logoFile) return

    const formData = new FormData()
    formData.append('file', logoFile)

    console.log(formData)

    // Make the request to upload the logo to the backend
    const response = await fetch('http://43.205.197.170:8080/club/uploadImage', {
      method: 'POST',
      headers: {
        'Authorization': loginState.token
      },
      body: formData
    })

    const result = await response.text()
    console.log(result)
    if (response.ok) {
      console.log("Logo uploaded successfully:", result)
      const token: string = localStorage.getItem("token") as string;
      fetchUserData(token);
      setShowLogoUploadDialog(false)
    } else {
      const errorData = await response.json();
      console.log(errorData.message || "Failed to submit the form");
    }
  }

  const handleProfileUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {

  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold mr-8">CampusEvents</h1>
            <nav>
              <ul className="flex space-x-4">
                <li><a href="#" className="text-primary hover:text-primary/80">Dashboard</a></li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <h4 className="mb-4 text-sm font-medium leading-none">Notifications</h4>
                  {notifications.map((notification) => (
                    <div key={notification.id} className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                      <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{notification.message}</p>
                        <p className="text-sm text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profileDetails.image} alt={profileDetails.clubName[0]} />
                    <AvatarFallback>{profileDetails.clubName[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end" forceMount>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profileDetails.image} alt={profileDetails.clubName} />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{profileDetails.clubName}</p>
                      <p className="text-xs text-muted-foreground">{profileDetails.clubEmail}</p>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setShowProfileDialog(true)}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                  </div>
                </div>
                <div className="mt-4 border-t pt-4">
                  <Button onClick={handleLogOut} variant="ghost" className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList onClick={() => fetchClubCreatedEvents()}>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="new-event">New Event Request</TabsTrigger>
          </TabsList>
          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Approved Events</h2>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Search events..."
                  className="w-64"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Start Date & Time</TableHead>
                      <TableHead>End Date & Time</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Registrations</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event: Event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>{`${event.startDate} ${event.startTime}`}</TableCell>
                        <TableCell>{`${event.endDate} ${event.endTime}`}</TableCell>
                        <TableCell>{event.venue}</TableCell>
                        <TableCell>{event.capacity}</TableCell>
                        <TableCell>{event.registration}</TableCell>
                        <TableCell>
                          <Badge variant={event.approval.toLowerCase() === "approved" ? "default" : "secondary"}>
                            {event.approval[0].toUpperCase() + event.approval.split(event.approval[0])[1]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => handleViewEvent(event)}>View</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>{selectedEvent?.title}</DialogTitle>
                                <DialogDescription>Event Details</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 items-center gap-4">
                                  <img src={selectedEvent?.poster} alt={selectedEvent?.title} className="w-full h-48 object-cover rounded-md" />
                                  <div>
                                    <p><strong>Start Date and Time:</strong> {`${selectedEvent?.startDate} ${selectedEvent?.startTime}`}</p>
                                    <p><strong>End Date and Time:</strong> {`${selectedEvent?.endDate} ${selectedEvent?.endTime}`}</p>
                                    <p><strong>Venue:</strong> {selectedEvent?.venue}</p>
                                    <p><strong>Capacity:</strong> {selectedEvent?.capacity}</p>
                                    <p><strong>Registrations:</strong> {selectedEvent?.registration}</p>
                                    <p><strong>Status:</strong> {event.approval[0].toUpperCase() + event.approval.split(event.approval[0])[1]}</p>
                                  </div>
                                </div>
                                <div>
                                  <strong>Description:</strong>
                                  <p>{selectedEvent?.description}</p>
                                </div>
                                <Button onClick={() => registerdStudentsList(selectedEvent?.id)}>View Registration List</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="new-event">
            <Card>
              <CardHeader>
                <CardTitle>Request New Event</CardTitle>
                <CardDescription>Fill out the form below to request a new event.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="id">Event ID</Label>
                    <Input
                      id="id"
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      placeholder="Enter event ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="Enter event venue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="Enter event capacity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter event description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attachments">Attachments</Label>
                    <Input id="attachments" type="file" multiple onChange={handleFileChange} />
                  </div>
                  <Button type="submit">Submit</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Cancelling this event will remove it from the system and notify all registered participants.
            </AlertDescription>
          </Alert>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cancel-confirmation" className="text-right">
                Type "cancel" to confirm:
              </Label>
              <Input
                id="cancel-confirmation"
                value={cancelConfirmation}
                onChange={(e) => setCancelConfirmation(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Close
            </Button>
            <Button variant="destructive" onClick={confirmCancelEvent} disabled={cancelConfirmation.toLowerCase() !== "cancel"}>
              Cancel Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>View and edit your profile information</DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
          </form>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Registration List Dialog */}
      <Dialog open={showRegistrationList} onOpenChange={setShowRegistrationList}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registration List</DialogTitle>
            <DialogDescription>Students registered for this event</DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registeredStudents.length == 0 && <div className="text-green-600">No user registered for this event yet.</div>}
              {registeredStudents.map((student, index) => (
                <TableRow key={index}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>View and edit your profile information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <Button type="button" onClick={() => setShowLogoUploadDialog(true)}>
              Upload Club Logo
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Logo Upload Dialog */}
      <Dialog open={showLogoUploadDialog} onOpenChange={setShowLogoUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Club Logo</DialogTitle>
            <DialogDescription>Choose a new logo for your club</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              {logoPreview ? (
                <img src={profileDetails.image} alt="Logo Preview" className="w-32 h-32 object-cover rounded-full" />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
            />
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setShowLogoUploadDialog(false)}>Cancel</Button>
            <Button type="button" onClick={() => handleLogoUpload()} disabled={!logoFile}>
              Upload Logo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}