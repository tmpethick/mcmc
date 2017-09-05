module Thesis.Transformer where
import Control.Monad.Trans.Maybe
import Control.Monad.State

pop :: MaybeT (State [a]) a
pop = do 
     s <- lift get
     case s of 
       []     -> MaybeT $ return Nothing
       (r:sx) -> do
          lift $ put sx
          return r

push :: a -> MaybeT (State [a]) ()  
push x = do 
    s <- lift get 
    lift . put $ x:s
    return ()

program1 = pop >> pop >> pop
program2 = pop >> push 3 >> pop

result1 = runState (runMaybeT program2) [1, 2] == (Nothing, [])
result2 = runState (runMaybeT program2) [1, 2] == (Just 3, [2])
  