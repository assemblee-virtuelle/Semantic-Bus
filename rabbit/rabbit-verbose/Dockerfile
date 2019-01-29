FROM rabbitmq

ENV RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="-rabbit log [{level, debug}, {console, [{enabled, true}]} ]"
RUN rabbitmq-plugins enable --offline rabbitmq_management
RUN rabbitmq-plugins enable --offline rabbitmq_stomp
RUN rabbitmq-plugins enable --offline rabbitmq_web_stomp


EXPOSE 15671 15672 15674 61613
