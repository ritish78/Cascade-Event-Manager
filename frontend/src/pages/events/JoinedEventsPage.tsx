import { UserEventsPage } from "./UserEventsPage";

const JoinedEventsPage = () => (
  <UserEventsPage endpoint="/events/joined" title="Events I'm Part Of" showStatusFilter={true} />
);

export default JoinedEventsPage;
